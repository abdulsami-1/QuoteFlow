import { test, expect } from '@playwright/test'

async function loginAsDemo(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@quoteflow.demo')
  await page.getByLabel(/password/i).fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/dashboard/)
}

test.describe('Dashboard', () => {
  test('leads table renders after login', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 })
  })

  test('all 5 seed leads are visible', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await expect(page.getByText('Sara Malik')).toBeVisible()
    await expect(page.getByText('James Obi')).toBeVisible()
    await expect(page.getByText('Priya Nair')).toBeVisible()
    await expect(page.getByText('Tom Walsh')).toBeVisible()
    await expect(page.getByText('Lena Choi')).toBeVisible()
  })

  test('clicking a lead row navigates to detail view', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await page.getByText('Sara Malik').first().click()
    await expect(page).toHaveURL(/\/dashboard\/leads\//)
    await expect(page.getByText('Sara Malik')).toBeVisible()
  })

  test('lead detail shows AI summary', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await page.getByText('Sara Malik').first().click()
    await expect(page.getByText(/AI Summary/i)).toBeVisible()
  })

  test('lead detail shows full intake transcript', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await page.getByText('Sara Malik').first().click()
    await expect(page).toHaveURL(/\/dashboard\/leads\//)
    // Transcript section should be visible
    await expect(page.getByText(/Intake Responses/i)).toBeVisible()
    // At least one Q&A entry should render
    await expect(page.getByText(/business name/i).first()).toBeVisible()
  })

  test('lead detail shows quote range', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await page.getByText('Sara Malik').first().click()
    // Sara has $800–$1,200
    await expect(page.getByText(/800/)).toBeVisible()
    await expect(page.getByText(/1,200/)).toBeVisible()
  })

  test('lead detail shows status selector', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await page.getByText('Sara Malik').first().click()
    // Status select should be visible
    await expect(page.getByRole('combobox').first()).toBeVisible()
  })

  test('lead detail shows urgency badge', async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/dashboard/leads')
    await page.getByText('Sara Malik').first().click()
    // Sara has HIGH urgency
    await expect(page.getByText(/HIGH/i)).toBeVisible()
  })

  test('sidebar navigation is visible', async ({ page }) => {
    await loginAsDemo(page)
    await expect(page.getByText('QuoteFlow')).toBeVisible()
    await expect(page.getByRole('link', { name: /leads/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /services/i })).toBeVisible()
  })

  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/dashboard/leads')
    await expect(page).toHaveURL(/\/login/)
  })
})
