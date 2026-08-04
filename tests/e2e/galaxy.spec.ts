import { expect, test, type Page } from '@playwright/test'

import {
  dualismIdeaId,
  fixtureAllKeyIdeas,
  fixtureKeyIdeaDetail,
  fixturePhilosopherDetail,
  fixturePhilosophers,
} from './fixtures/philosophers'

const featuredPhilosopher = fixturePhilosophers[0]

async function interceptPhilosophersApi(
  page: Page,
  options: { delayCollectionMs?: number; failCollection?: boolean } = {},
) {
  await page.route('https://philosophersapi.com/Images/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#18213a"/><circle cx="50" cy="38" r="21" fill="#edf0ff"/><path d="M18 100c3-28 19-42 32-42s29 14 32 42" fill="#aab6e8"/></svg>',
    })
  })

  await page.route(
    'https://philosophersapi.com/api/keyideas**',
    async (route) => {
      const pathname = new URL(route.request().url()).pathname
      if (pathname.endsWith('/keyideas')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(fixtureAllKeyIdeas),
        })
        return
      }

      const id = decodeURIComponent(pathname.split('/').at(-1) ?? '')
      const keyIdea =
        fixtureAllKeyIdeas.find((candidate) => candidate.id === id) ??
        fixtureAllKeyIdeas[0]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fixtureKeyIdeaDetail(keyIdea)),
      })
    },
  )

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
        featuredPhilosopher
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

async function selectFeaturedFromExplorer(page: Page) {
  await page
    .getByRole('button', { name: 'Explore accessible list' })
    .click()
  await page
    .getByRole('button', { name: new RegExp(featuredPhilosopher.name) })
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

test('galaxy visibly reaches ready state with semantic telemetry', async ({
  page,
}) => {
  await openReadyGalaxy(page)

  await expect(page.locator('main')).toHaveAttribute('data-scene-ready', 'true')
  const telemetry = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(telemetry).toMatchObject({
    philosopherCount: 114,
    visibleNodeCount: 114,
    overviewReady: true,
    focusMode: 'galaxy',
    selectedPhilosopherId: null,
  })
  expect(telemetry?.drawCalls).toBeGreaterThan(0)
})

test('canvas has non-zero dimensions', async ({ page }) => {
  await openReadyGalaxy(page)
  const box = await page.locator('canvas').boundingBox()
  expect(box?.width).toBeGreaterThan(300)
  expect(box?.height).toBeGreaterThan(500)
})

test('a philosopher can be hovered directly in the canvas', async ({ page }) => {
  await openReadyGalaxy(page)
  const target = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__?.interactionTarget,
  )
  expect(target).toBeDefined()
  await page.mouse.move(target?.screenX ?? 0, target?.screenY ?? 0)
  await expect(page.locator('.galaxy-hover-card')).toBeVisible()
})

test('a luminous philosopher can be selected directly from the canvas', async ({
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

test('philosopher focus shows portrait, identity, and key ideas', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)

  await expect(
    page.getByRole('heading', { name: featuredPhilosopher.name }),
  ).toBeVisible()
  await expect(page.locator('.galaxy-scene-portrait--selected img')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Key ideas' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Select idea 1' })).toBeVisible()
})

test('an idea can be selected and updates URL focus state', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)
  await page.getByRole('button', { name: 'Select idea 1' }).click()

  await expect(page.getByTestId('selected-idea-detail')).toBeVisible()
  await expect(page).toHaveURL(/idea=/)
  await expect
    .poll(() =>
      page.evaluate(() => window.__NOESIS_GALAXY_TELEMETRY__?.focusMode),
    )
    .toBe('idea')
})

test('explicit agreement and disagreement connections render', async ({ page }) => {
  await openReadyGalaxy(
    page,
    `/?philosopher=${featuredPhilosopher.id}&idea=${dualismIdeaId}`,
  )

  await expect(page.getByText('1 continuous agreements')).toBeVisible()
  await expect(page.getByText('2 interrupted disagreements')).toBeVisible()
  await expect(page.locator('.galaxy-relation-label--agreement')).toHaveCount(1)
  await expect(page.locator('.galaxy-relation-label--disagreement')).toHaveCount(2)
  const telemetry = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(telemetry).toMatchObject({
    agreementEdgeCount: 1,
    disagreementEdgeCount: 2,
    focusMode: 'idea',
  })
})

test('philosopher and idea URL state restores directly', async ({ page }) => {
  await openReadyGalaxy(
    page,
    `/?philosopher=${featuredPhilosopher.id}&idea=${dualismIdeaId}`,
  )
  await expect(
    page.getByRole('heading', { name: featuredPhilosopher.name }),
  ).toBeVisible()
  await expect(page.getByTestId('selected-idea-detail')).toBeVisible()
})

test('back returns to philosopher before returning to galaxy', async ({ page }) => {
  await openReadyGalaxy(
    page,
    `/?philosopher=${featuredPhilosopher.id}&idea=${dualismIdeaId}`,
  )
  await page.getByRole('button', { name: 'Back to philosopher' }).click()
  await expect(page).not.toHaveURL(/idea=/)
  await expect(
    page.getByRole('heading', { name: featuredPhilosopher.name }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Back to galaxy' }).click()
  await expect(page).not.toHaveURL(/philosopher=/)
})

test('reset clears selection and returns to the overview', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)
  await page.getByRole('button', { name: 'Reset view' }).click()

  await expect(page).not.toHaveURL(/philosopher=/)
  await expect
    .poll(() =>
      page.evaluate(() => window.__NOESIS_GALAXY_TELEMETRY__?.overviewReady),
    )
    .toBe(true)
})

test('invalid philosopher ID recovers safely', async ({ page }) => {
  await openReadyGalaxy(page, '/?philosopher=invalid-id')
  await expect(page.getByText('Philosopher not found')).toBeVisible()
  await page.getByRole('button', { name: 'Clear selection' }).click()
  await expect(page).not.toHaveURL(/philosopher=/)
})

test('mobile detail sheet and controls remain reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)

  await expect(page.locator('.galaxy-summary')).toBeInViewport()
  await expect(page.getByRole('button', { name: 'Back to galaxy' })).toBeInViewport()
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))
  expect(widths.document).toBe(widths.viewport)
})

test('connections and school regions can be toggled independently', async ({
  page,
}) => {
  await openReadyGalaxy(page)
  await page.getByRole('button', { name: 'Connections on' }).click()
  await page.getByRole('button', { name: 'Schools on' }).click()
  await expect(page.getByRole('button', { name: 'Connections off' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
  await expect(page.getByRole('button', { name: 'Schools off' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('reduced motion remains active through scene transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)
  await expect(page.locator('main')).toHaveAttribute('data-reduced-motion', 'true')
})

test('no uncaught error occurs while exploring relationships', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await openReadyGalaxy(
    page,
    `/?philosopher=${featuredPhilosopher.id}&idea=${dualismIdeaId}`,
  )
  await page.getByRole('button', { name: 'Back to philosopher' }).click()
  expect(pageErrors).toEqual([])
})

test('Chromium can produce a non-empty galaxy screenshot', async ({ page }) => {
  await openReadyGalaxy(page)
  const screenshot = await page.screenshot()
  expect(screenshot.byteLength).toBeGreaterThan(50_000)
})
