import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('/ redirects to /dashboard which redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('signup page renders', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('heading', { name: /create/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('login with demo credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@quoteflow.demo')
    await page.getByLabel(/password/i).fill('demo1234')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('protected route redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/leads')
    await expect(page).toHaveURL(/\/login/)
  })
})
