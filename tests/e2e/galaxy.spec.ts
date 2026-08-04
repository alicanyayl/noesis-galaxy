import { expect, test, type Page } from '@playwright/test'

import {
  fixturePhilosopherDetail,
  fixturePhilosophers,
} from './fixtures/philosophers'

const firstPhilosopher = fixturePhilosophers[0]

async function interceptPhilosophersApi(
  page: Page,
  options: { delayCollectionMs?: number; failCollection?: boolean } = {},
) {
  await page.route(
    'https://philosophersapi.com/api/philosophers**',
    async (route) => {
      const pathname = new URL(route.request().url()).pathname

      if (pathname.endsWith('/philosophers')) {
        if (options.delayCollectionMs) {
          await new Promise((resolve) =>
            setTimeout(resolve, options.delayCollectionMs),
          )
        }
        await route.fulfill({
          status: options.failCollection ? 503 : 200,
          contentType: 'application/json',
          body: JSON.stringify(
            options.failCollection
              ? { reason: 'Fixture unavailable' }
              : fixturePhilosophers,
          ),
        })
        return
      }

      const id = decodeURIComponent(pathname.split('/').at(-1) ?? '')
      const philosopher =
        fixturePhilosophers.find((candidate) => candidate.id === id) ??
        firstPhilosopher
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixturePhilosopherDetail(philosopher)),
      })
    },
  )
}

async function openReadyGalaxy(page: Page, path = '/') {
  await interceptPhilosophersApi(page)
  await page.goto(path)
  await expect(page.getByTestId('scene-ready-status')).toContainText(
    '114 philosophers positioned',
  )
}

async function selectFirstFromExplorer(page: Page) {
  await page
    .getByRole('button', { name: 'Explore accessible list' })
    .click()
  await page
    .getByRole('button', { name: new RegExp(firstPhilosopher.name) })
    .click()
}

test('application shows a visible loading state', async ({ page }) => {
  await interceptPhilosophersApi(page, { delayCollectionMs: 700 })
  await page.goto('/')

  await expect(page.getByText('Connecting to the archive')).toBeVisible()
  await expect(page.getByTestId('scene-ready-status')).toContainText(
    '114 philosophers positioned',
  )
})

test('galaxy scene becomes ready', async ({ page }) => {
  await openReadyGalaxy(page)

  await expect(page.locator('main')).toHaveAttribute(
    'data-scene-ready',
    'true',
  )
})

test('canvas has non-zero dimensions', async ({ page }) => {
  await openReadyGalaxy(page)

  const box = await page.locator('canvas').boundingBox()
  expect(box?.width).toBeGreaterThan(300)
  expect(box?.height).toBeGreaterThan(500)
})

test('scene telemetry reports every fixture philosopher positioned', async ({
  page,
}) => {
  await openReadyGalaxy(page)

  const telemetry = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(telemetry).toMatchObject({
    philosopherCount: 114,
    visibleNodeCount: 114,
    overviewReady: true,
    selectedPhilosopherId: null,
  })
  expect(telemetry?.historicalMinX).toBeLessThan(
    telemetry?.historicalMaxX ?? 0,
  )
})

test('historical orientation text is visible', async ({ page }) => {
  await openReadyGalaxy(page)

  await expect(
    page.getByText(
      'Horizontal position follows birth year. Nearby clusters share school metadata—not direct influence.',
    ),
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Historical direction' }),
  ).toBeVisible()
})

test('a philosopher can be selected from the accessible explorer', async ({
  page,
}) => {
  await openReadyGalaxy(page)
  await selectFirstFromExplorer(page)

  await expect(
    page.getByRole('heading', { name: firstPhilosopher.name }),
  ).toBeVisible()
})

test('a luminous node can be selected directly from the canvas', async ({
  page,
}) => {
  await openReadyGalaxy(page)
  const target = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__?.interactionTarget,
  )

  expect(target).toBeDefined()
  await page.mouse.click(target?.screenX ?? 0, target?.screenY ?? 0)
  await expect(page).toHaveURL(
    new RegExp(`philosopher=${target?.philosopherId}`),
  )
})

test('selected summary loads deterministic details', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFirstFromExplorer(page)

  await expect(page.getByText('Deterministic Archive')).toBeVisible()
  await expect(page.getByText('Validated key ideas')).toBeVisible()
})

test('selection updates the shareable URL', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFirstFromExplorer(page)

  await expect(page).toHaveURL(
    new RegExp(`philosopher=${firstPhilosopher.id}`),
  )
})

test('reset clears selection and returns to the overview', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFirstFromExplorer(page)
  await page.getByRole('button', { name: 'Reset view' }).click()

  await expect(page).not.toHaveURL(/philosopher=/)
  await expect(
    page.getByRole('heading', { name: firstPhilosopher.name }),
  ).toHaveCount(0)
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__NOESIS_GALAXY_TELEMETRY__?.overviewReady,
      ),
    )
    .toBe(true)
})

test('invalid philosopher ID recovers safely', async ({ page }) => {
  await openReadyGalaxy(page, '/?philosopher=invalid-id')

  await expect(page.getByText('Philosopher not found')).toBeVisible()
  await page.getByRole('button', { name: 'Clear selection' }).click()
  await expect(page).not.toHaveURL(/philosopher=/)
})

test('mobile controls remain reachable without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openReadyGalaxy(page)

  await expect(
    page.getByRole('button', { name: 'Explore accessible list' }),
  ).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Eras on' })).toBeInViewport()
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))
  expect(widths.document).toBe(widths.viewport)
})

test('no uncaught page error occurs', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))

  await openReadyGalaxy(page)
  await selectFirstFromExplorer(page)
  await page.getByRole('button', { name: 'Close philosopher summary' }).click()

  expect(pageErrors).toEqual([])
})

test('reduced motion remains active through scene readiness', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openReadyGalaxy(page)

  await expect(page.locator('main')).toHaveAttribute(
    'data-reduced-motion',
    'true',
  )
})
