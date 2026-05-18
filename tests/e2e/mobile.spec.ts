import { test, expect } from '@playwright/test'

test.describe('Mobile viewport (375px)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  async function loginAsDemo(page: import('@playwright/test').Page) {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@quoteflow.demo')
    await page.getByLabel(/password/i).fill('demo1234')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/dashboard/)
  }

  test('login page renders at 375px', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('login form fits within 375px — no horizontal scroll', async ({ page }) => {
    await page.goto('/login')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(375)
  })

  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('mobile top bar visible after login', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await expect(page.getByText('QuoteFlow')).toBeVisible()
    // hamburger menu button visible on mobile
    await expect(page.getByRole('button').first()).toBeVisible()
  })

  test('mobile drawer opens on menu tap', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    // Find the menu toggle button (Menu icon)
    const menuButton = page.locator('button').filter({ hasText: '' }).first()
    await menuButton.click()
    await expect(page.getByRole('link', { name: /leads/i })).toBeVisible()
  })

  test('leads page renders at 375px', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await expect(page.getByRole('heading', { name: /leads/i })).toBeVisible({ timeout: 10000 })
  })

  test('stats page renders at 375px', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/stats')
    await expect(page.getByRole('heading', { name: /stats/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Total Leads')).toBeVisible({ timeout: 10000 })
  })

  test('settings page renders at 375px', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/settings')
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible({ timeout: 10000 })
  })

  test('lead detail page renders at 375px', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await page.getByText('Sara Malik').first().click()
    await expect(page).toHaveURL(/\/dashboard\/leads\//)
    await expect(page.getByText('Sara Malik')).toBeVisible()
    await expect(page.getByText(/AI Summary/i)).toBeVisible()
  })
})
