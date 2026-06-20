import { expect, test } from '@playwright/test'

test('desktop workspace supports core interactions', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Dinner with Friends/)
  await expect(page.getByText('Dinner with Friends.')).toBeVisible()
  await expect(page.getByLabel('Move or minimize Calculator window')).toBeVisible()

  await page.getByRole('button', { name: 'Dark' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'dark')

  await page.getByRole('button', { name: 'Light' }).click()
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'light')

  await page.getByRole('button', { name: 'Calculator window', exact: true }).click()
  await expect(page.getByLabel('Move or minimize Calculator window')).toBeHidden()

  await page.getByRole('button', { name: 'Calculator window', exact: true }).click()
  await expect(page.getByLabel('Move or minimize Calculator window')).toBeVisible()

  await expect(page.getByRole('grid', { name: 'Tetris board' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible()

  const image = page.getByAltText('Portrait of Alex Baldwin')
  await expect(image).toBeVisible()
  await expect
    .poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0))
    .toBe(true)
})

test('first viewport stays within the mobile width', async ({ page }, testInfo) => {
  await page.goto('/')

  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }))

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1)
  await expect(page.getByRole('button', { name: 'Dark' })).toBeVisible()
  await expect(page.getByRole('grid', { name: 'Tetris board' })).toBeVisible()

  const messageField = page.getByLabel('Message')
  await messageField.click()
  await page.keyboard.type('hello world')
  await expect(messageField).toHaveValue('hello world')

  if (testInfo.project.name !== 'mobile') return

  await page.mouse.wheel(0, 800)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0)
  await expect(page.getByLabel('Move or minimize Music window')).toBeVisible()
})
