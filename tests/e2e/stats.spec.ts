import { test, expect } from '@playwright/test'

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@quoteflow.demo')
  await page.getByLabel(/password/i).fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
}

test.describe('Stats page', () => {
  test('stats page renders heading after login', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/stats')
    await expect(page.getByRole('heading', { name: /stats/i })).toBeVisible()
  })

  test('metric cards are visible', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/stats')
    await expect(page.getByText('Total Leads')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Leads This Week')).toBeVisible()
    await expect(page.getByText('Avg Quote Value')).toBeVisible()
    await expect(page.getByText('Conversion Rate')).toBeVisible()
  })

  test('bar chart section is visible', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/stats')
    await expect(page.getByText(/last 30 days/i)).toBeVisible({ timeout: 10000 })
  })

  test('status breakdown section is visible', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/stats')
    await expect(page.getByText(/status breakdown/i)).toBeVisible({ timeout: 10000 })
  })

  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/dashboard/stats')
    await expect(page).toHaveURL(/\/login/)
  })
})
