import { expect, test, type Page } from '@playwright/test'

import {
  dualismIdeaId,
  fixtureAllKeyIdeas,
  fixtureKeyIdeaDetail,
  fixturePhilosopherDetail,
  fixturePhilosophers,
} from './fixtures/philosophers'

const featuredPhilosopher = fixturePhilosophers[0]

function positionDelta(
  first: { x: number; y: number; z: number },
  second: { x: number; y: number; z: number },
) {
  return Math.hypot(
    first.x - second.x,
    first.y - second.y,
    first.z - second.z,
  )
}

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
    cameraMode: 'galaxy-overview',
    dollyToCursor: false,
    distantStarCount: 3_200,
    midStarCount: 900,
    foregroundDustCount: 48,
    supernovaCount: 2,
  })
  expect(telemetry?.backgroundStarCount).toBe(4_148)
  expect(telemetry?.drawCalls).toBeGreaterThan(0)
})

test('repeated wheel zoom preserves target without direction bounce', async ({
  page,
}) => {
  await openReadyGalaxy(page)
  const before = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  const canvas = await page.locator('canvas').boundingBox()
  expect(canvas).not.toBeNull()

  await page.mouse.move(
    (canvas?.x ?? 0) + (canvas?.width ?? 0) * 0.72,
    (canvas?.y ?? 0) + (canvas?.height ?? 0) * 0.48,
  )
  const distances: number[] = []
  for (const delta of [-100, -100, -100, 100, 100, 100]) {
    await page.mouse.wheel(0, delta)
    await page.waitForTimeout(420)
    distances.push(
      (await page.evaluate(
        () => window.__NOESIS_GALAXY_TELEMETRY__?.cameraDistance,
      )) ?? 0,
    )
  }

  expect(distances[1]).toBeLessThan(distances[0])
  expect(distances[2]).toBeLessThan(distances[1])
  expect(distances[3]).toBeGreaterThan(distances[2])
  expect(distances[4]).toBeGreaterThan(distances[3])
  expect(distances[5]).toBeGreaterThan(distances[4])
  expect(distances[5]).toBeCloseTo(before?.cameraDistance ?? 0, 2)

  const after = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(positionDelta(after!.cameraTarget, before!.cameraTarget)).toBeLessThan(
    0.001,
  )
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

test('overview wheel zoom remains inside the configured distance envelope', async ({
  page,
}) => {
  test.setTimeout(45_000)
  await openReadyGalaxy(page)
  const canvas = await page.locator('canvas').boundingBox()
  await page.mouse.move(
    (canvas?.x ?? 0) + (canvas?.width ?? 0) / 2,
    (canvas?.y ?? 0) + (canvas?.height ?? 0) / 2,
  )

  for (let index = 0; index < 6; index += 1) {
    await page.mouse.wheel(0, 2_000)
  }
  await page.waitForTimeout(900)
  const far = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(far!.cameraDistance).toBeLessThanOrEqual(
    far!.cameraMaxDistance + 0.02,
  )

  for (let index = 0; index < 8; index += 1) {
    await page.mouse.wheel(0, -2_000)
  }
  await page.waitForTimeout(900)
  const near = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(near!.cameraDistance).toBeGreaterThanOrEqual(
    near!.cameraMinDistance - 0.02,
  )
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
  await expect
    .poll(() =>
      page.evaluate(() => window.__NOESIS_GALAXY_TELEMETRY__?.cameraMode),
    )
    .toBe('philosopher-focus')
  const telemetry = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(telemetry?.orbitingIdeaCount).toBeGreaterThan(0)
  expect(telemetry?.orbitMotionEnabled).toBe(true)
})

test('focused idea satellites move in normal motion mode', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)
  const satellite = page
    .locator('.galaxy-idea-label[data-orbiting="true"]')
    .first()
  await expect(satellite).toBeVisible()
  const before = await satellite.boundingBox()
  await page.waitForTimeout(1_400)
  const after = await satellite.boundingBox()

  expect(
    Math.hypot(
      (after?.x ?? 0) - (before?.x ?? 0),
      (after?.y ?? 0) - (before?.y ?? 0),
    ),
  ).toBeGreaterThan(0.5)
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
  await expect(page.locator('.galaxy-relation-label--disagreement')).toHaveCount(1)
  const telemetry = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(telemetry).toMatchObject({
    agreementEdgeCount: 1,
    disagreementEdgeCount: 2,
    focusMode: 'idea',
    cameraMode: 'idea-focus',
  })
  expect(telemetry!.relationEdgeBudget).toBeLessThanOrEqual(8)
  expect(
    await page
      .locator('.galaxy-relation-label--agreement')
      .first()
      .evaluate((element) => getComputedStyle(element).borderStyle),
  ).not.toBe('dashed')
  expect(
    await page
      .locator('.galaxy-relation-label--disagreement')
      .first()
      .evaluate((element) => getComputedStyle(element).borderStyle),
  ).toBe('dashed')
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
  await openReadyGalaxy(page, `/?philosopher=${featuredPhilosopher.id}`)
  await expect
    .poll(() =>
      page.evaluate(() => window.__NOESIS_GALAXY_TELEMETRY__?.cameraMode),
    )
    .toBe('philosopher-focus')
  const initialTarget = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__!.cameraTarget,
  )
  await page.getByRole('button', { name: 'Show all 7 ideas' }).click()
  await page.getByRole('button', { name: 'Select idea 7' }).click()
  await expect
    .poll(() =>
      page.evaluate(() => window.__NOESIS_GALAXY_TELEMETRY__?.cameraMode),
    )
    .toBe('idea-focus')
  await page.getByRole('button', { name: 'Back to philosopher' }).click()
  await expect(page).not.toHaveURL(/idea=/)
  await expect(
    page.getByRole('heading', { name: featuredPhilosopher.name }),
  ).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() => window.__NOESIS_GALAXY_TELEMETRY__?.cameraMode),
    )
    .toBe('philosopher-focus')
  const restoredTarget = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__!.cameraTarget,
  )
  expect(positionDelta(restoredTarget, initialTarget)).toBeLessThan(0.005)

  await page.getByRole('button', { name: 'Back to galaxy' }).click()
  await expect(page).not.toHaveURL(/philosopher=/)
  await expect
    .poll(() =>
      page.evaluate(() => window.__NOESIS_GALAXY_TELEMETRY__?.cameraMode),
    )
    .toBe('galaxy-overview')
})

test('reset clears selection and returns to the overview', async ({ page }) => {
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)
  await page.getByRole('button', { name: 'Reset' }).click()

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
  const motionControl = page.getByRole('button', { name: 'Motion' })
  await expect(motionControl).toBeInViewport()
  expect((await motionControl.boundingBox())?.height).toBeGreaterThanOrEqual(44)
  const canvas = await page.locator('canvas').boundingBox()
  await page.mouse.move(
    (canvas?.x ?? 0) + (canvas?.width ?? 0) / 2,
    (canvas?.y ?? 0) + (canvas?.height ?? 0) * 0.42,
  )
  await page.mouse.wheel(0, -500)
  await page.waitForTimeout(500)
  const mobileCamera = await page.evaluate(
    () => window.__NOESIS_GALAXY_TELEMETRY__,
  )
  expect(mobileCamera!.cameraDistance).toBeGreaterThanOrEqual(
    mobileCamera!.cameraMinDistance - 0.02,
  )
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
  await page.getByRole('button', { name: 'Schools' }).click()
  await expect(page.getByRole('button', { name: 'Schools' })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await selectFeaturedFromExplorer(page)
  await page.getByRole('button', { name: 'Links' }).click()
  await expect(page.getByRole('button', { name: 'Links' })).toHaveAttribute(
    'aria-pressed',
    'false',
  )
})

test('accessible explorer supports keyboard selection', async ({ page }) => {
  await openReadyGalaxy(page)
  const explorer = page.getByRole('button', {
    name: 'Explore accessible list',
  })
  await explorer.focus()
  await expect(explorer).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: 'Philosophers through history' }),
  ).toBeVisible()
  const philosopher = page.getByRole('button', {
    name: new RegExp(featuredPhilosopher.name),
  })
  await philosopher.focus()
  await page.keyboard.press('Enter')
  await expect(
    page.getByRole('heading', { name: featuredPhilosopher.name }),
  ).toBeVisible()
})

test('WebGL fallback preserves philosopher access', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'WebGL2RenderingContext', {
      configurable: true,
      value: undefined,
    })
  })
  await interceptPhilosophersApi(page)
  await page.goto('/')
  await expect(page.getByText('The historical scene is unavailable.')).toBeVisible()
  await selectFeaturedFromExplorer(page)
  await expect(
    page.getByRole('heading', { name: featuredPhilosopher.name }),
  ).toBeVisible()
})

test('reduced motion remains active through scene transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openReadyGalaxy(page)
  await selectFeaturedFromExplorer(page)
  await expect(page.locator('main')).toHaveAttribute('data-reduced-motion', 'true')
  const satellite = page
    .locator('.galaxy-idea-label[data-orbiting="true"]')
    .first()
  await expect(satellite).toBeVisible()
  const before = await satellite.boundingBox()
  await page.waitForTimeout(1_200)
  const after = await satellite.boundingBox()
  expect(
    Math.hypot(
      (after?.x ?? 0) - (before?.x ?? 0),
      (after?.y ?? 0) - (before?.y ?? 0),
    ),
  ).toBeLessThan(0.25)
  expect(
    await page.evaluate(
      () => window.__NOESIS_GALAXY_TELEMETRY__?.orbitMotionEnabled,
    ),
  ).toBe(false)
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

test('Chromium can generate a non-empty final review screenshot', async ({ page }) => {
  await openReadyGalaxy(page)
  const screenshot = await page.screenshot()
  expect(screenshot.byteLength).toBeGreaterThan(50_000)
})
