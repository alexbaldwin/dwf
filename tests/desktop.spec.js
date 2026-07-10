import { expect, test } from '@playwright/test'

function overlapArea(first, second) {
  const width = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x))
  const height = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y))
  return width * height
}

async function getWorkspaceBoxes(page) {
  return page.locator('[data-window], [data-region]').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const style = window.getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          name: element.dataset.window || element.dataset.region,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        }
      })
  )
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('workspace features behave as complete interactions', async ({ page }) => {
  await expect(page).toHaveTitle(/Dinner with Friends/)
  await expect(page.getByRole('heading', { name: /Dinner with Friends/i })).toBeVisible()

  const darkButton = page.getByRole('button', { name: 'Dark' })
  await darkButton.focus()
  await darkButton.press('Space')
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Light' }).click()

  await page.getByRole('spinbutton', { name: 'Bill', exact: true }).fill('100')
  await expect(page.getByText('$30.00', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Add a guest' }).click()
  await expect(page.getByText('$24.00', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Next portrait' }).click()
  const portrait = page.getByAltText('Portrait of Justin')
  await expect(portrait).toBeVisible()
  await expect.poll(() => portrait.evaluate((image) => image.complete && image.naturalWidth > 0)).toBe(true)

  await page.getByLabel('Name').fill('Ada')
  await page.getByLabel('Email').fill('ada@example.com')
  await page.getByLabel('Message').fill('Save a seat for me.')
  await page.getByRole('button', { name: 'Save draft' }).click()
  await expect(page.getByText('Draft saved on this device.')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Name')).toHaveValue('Ada')
  await expect(page.getByLabel('Message')).toHaveValue('Save a seat for me.')

  await page.getByRole('button', { name: 'Minimize Leave a Note window' }).click()
  await expect(page.locator('[data-window="contact"]')).toBeHidden()
  await page.getByRole('button', { name: 'Contact window' }).click()
  await expect(page.locator('[data-window="contact"]')).toBeVisible()

  await expect(page.getByText('Playing', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(page.getByText('Paused', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Resume', exact: true }).click()

  await page.getByRole('button', { name: 'Play music' }).click()
  await expect(page.getByRole('button', { name: 'Pause music' })).toBeVisible()
  await page.getByRole('button', { name: 'Pause music' }).click()
  await expect(page.getByRole('button', { name: 'Play music' })).toBeVisible()
})

test('workspace has no horizontal overflow or overlapping surfaces', async ({ page }, testInfo) => {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }))
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1)

  const boxes = await getWorkspaceBoxes(page)
  for (let index = 0; index < boxes.length; index += 1) {
    for (let comparison = index + 1; comparison < boxes.length; comparison += 1) {
      expect(
        overlapArea(boxes[index], boxes[comparison]),
        `${boxes[index].name} overlaps ${boxes[comparison].name}`
      ).toBeLessThanOrEqual(1)
    }
  }

  if (testInfo.project.name === 'desktop') {
    for (const box of boxes.filter(({ name }) => !['hero', 'footer', 'window-dock'].includes(name))) {
      expect(box.x, `${box.name} starts outside the viewport`).toBeGreaterThanOrEqual(0)
      expect(box.right, `${box.name} extends past the viewport`).toBeLessThanOrEqual(metrics.viewportWidth)
      expect(box.y, `${box.name} starts above the viewport`).toBeGreaterThanOrEqual(0)
      expect(box.bottom, `${box.name} extends below the viewport`).toBeLessThanOrEqual(
        await page.evaluate(() => window.innerHeight)
      )
    }
  } else {
    await page.getByRole('button', { name: 'Music window' }).click()
    await expect(page.locator('[data-window="music"]')).toBeInViewport()
  }
})

test('desktop window placement remains bounded at common widths', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Desktop placement matrix')

  for (const { width, height } of [
    { width: 1280, height: 1000 },
    { width: 1366, height: 768 },
    { width: 1366, height: 1000 },
    { width: 1440, height: 1000 }
  ]) {
    await page.setViewportSize({ width, height })
    await page.reload()

    const boxes = await getWorkspaceBoxes(page)
    const windows = boxes.filter(({ name }) => !['hero', 'footer', 'window-dock'].includes(name))
    for (let index = 0; index < boxes.length; index += 1) {
      for (let comparison = index + 1; comparison < boxes.length; comparison += 1) {
        expect(
          overlapArea(boxes[index], boxes[comparison]),
          `${boxes[index].name} overlaps ${boxes[comparison].name} at ${width}x${height}`
        ).toBeLessThanOrEqual(1)
      }
    }
    for (const box of windows) {
      expect(box.x, `${box.name} starts outside ${width}x${height}`).toBeGreaterThanOrEqual(0)
      expect(box.right, `${box.name} extends past ${width}x${height}`).toBeLessThanOrEqual(width)
      if (height >= 900) {
        expect(box.bottom, `${box.name} extends below ${width}x${height}`).toBeLessThanOrEqual(height)
      }
    }
  }
})
