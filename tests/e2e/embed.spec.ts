import { test, expect } from '@playwright/test'

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@quoteflow.demo')
  await page.getByLabel(/password/i).fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
}

test.describe('Settings — embed code panel', () => {
  test('embed code is visible', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/settings')
    await expect(page.getByText('Embed Code')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/embed\.js/)).toBeVisible()
  })

  test('copy button copies embed code', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/settings')
    await page.getByRole('button', { name: /copy code/i }).click()
    await expect(page.getByText(/copied!/i)).toBeVisible()
  })

  test('preview widget button opens dialog', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/settings')
    await page.getByRole('button', { name: /preview widget/i }).click()
    await expect(page.getByText(/widget preview/i)).toBeVisible()
    await expect(page.locator('iframe')).toBeVisible()
  })

  test('preview dialog can be closed', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/settings')
    await page.getByRole('button', { name: /preview widget/i }).click()
    await expect(page.getByText(/widget preview/i)).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText(/widget preview/i)).not.toBeVisible()
  })

  test('brand color text input has valid hex value', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/settings')
    await page.waitForSelector('#brandColor', { timeout: 10000 })
    const textInput = page.locator('#brandColor')
    await expect(textInput).toHaveValue(/^#[0-9a-fA-F]{6}$/)
  })
})
