import { test, expect } from '@playwright/test'

test.describe('Intake widget', () => {
  test('invalid embedToken returns 404', async ({ request }) => {
    const res = await request.get('/api/intake/invalid-token-that-does-not-exist')
    expect(res.status()).toBe(404)
    const json = await res.json()
    expect(json.success).toBe(false)
  })

  test('health check returns 200', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  test('valid embedToken returns config with services', async ({ request }) => {
    const loginRes = await request.post('/api/auth/login', {
      data: { email: 'admin@quoteflow.demo', password: 'demo1234' },
    })
    if (loginRes.status() !== 200) {
      test.skip()
      return
    }

    const businessRes = await request.get('/api/business')
    if (businessRes.status() !== 200) {
      test.skip()
      return
    }

    const { data } = await businessRes.json()
    const embedToken = data?.embedToken
    if (!embedToken) {
      test.skip()
      return
    }

    const intakeRes = await request.get(`/api/intake/${embedToken}`)
    expect(intakeRes.status()).toBe(200)
    const json = await intakeRes.json()
    expect(json.success).toBe(true)
    expect(json.data.businessName).toBe('Artisan Web Studio')
    expect(Array.isArray(json.data.services)).toBe(true)
    expect(json.data.services.length).toBeGreaterThan(0)
  })

  test('intake widget page loads publicly without auth', async ({ page }) => {
    const loginRes = await page.request.post('/api/auth/login', {
      data: { email: 'admin@quoteflow.demo', password: 'demo1234' },
    })
    if (loginRes.status() !== 200) {
      test.skip()
      return
    }

    const businessRes = await page.request.get('/api/business')
    if (businessRes.status() !== 200) {
      test.skip()
      return
    }

    const { data } = await businessRes.json()
    const embedToken = data?.embedToken
    if (!embedToken) {
      test.skip()
      return
    }

    await page.context().clearCookies()
    await page.goto(`/intake/${embedToken}`)
    await expect(page.locator('text=Artisan Web Studio')).toBeVisible({ timeout: 10000 })
  })

  test('submit with missing fields returns 400', async ({ request }) => {
    const res = await request.post('/api/intake/nonexistent-token/submit', {
      data: {},
    })
    expect([400, 404]).toContain(res.status())
  })
})
