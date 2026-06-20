import { mkdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'

const port = process.env.PERF_PORT || '3100'
const url = process.env.PERF_URL || `http://127.0.0.1:${port}`
const ownsServer = !process.env.PERF_URL
const timeoutMs = 120_000

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForServer(targetUrl, deadlineMs) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < deadlineMs) {
    try {
      const response = await fetch(targetUrl)
      if (response.ok) return
    } catch {
      // Server is not ready yet.
    }
    await sleep(500)
  }
  throw new Error(`Timed out waiting for ${targetUrl}`)
}

function startServer() {
  const child = spawn('corepack', ['pnpm@11.8.0', 'exec', 'next', 'start', '-p', port], {
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  child.stdout.on('data', (chunk) => process.stdout.write(chunk))
  child.stderr.on('data', (chunk) => process.stderr.write(chunk))

  return child
}

function waitForServerExit(child) {
  return new Promise((_, reject) => {
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      const detail = signal ? `signal ${signal}` : `code ${code}`
      reject(new Error(`Next server exited before it was ready (${detail})`))
    })
  })
}

async function run() {
  const server = ownsServer ? startServer() : null
  let browser

  try {
    await (server
      ? Promise.race([waitForServer(url, timeoutMs), waitForServerExit(server)])
      : waitForServer(url, timeoutMs))
    browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    await page.goto(url, { waitUntil: 'networkidle' })
    const image = page.locator('img[alt="Portrait of Alex Baldwin"]')
    await image.waitFor({ state: 'visible' })
    await image.evaluate((element) => element.decode().catch(() => undefined))
    await mkdir('.perf', { recursive: true })
    await page.screenshot({ path: '.perf/home-desktop.png', fullPage: true })

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0]
      const paints = Object.fromEntries(
        performance.getEntriesByType('paint').map((entry) => [entry.name, entry.startTime])
      )
      const image = document.querySelector('img[alt="Portrait of Alex Baldwin"]')

      return {
        duration: navigation?.duration ?? null,
        domContentLoaded: navigation?.domContentLoadedEventEnd ?? null,
        load: navigation?.loadEventEnd ?? null,
        firstContentfulPaint: paints['first-contentful-paint'] ?? null,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        imageLoaded: Boolean(image?.complete && image.naturalWidth > 0)
      }
    })

    const failures = []
    if (!metrics.imageLoaded) failures.push('portrait image did not finish loading')
    if (metrics.scrollWidth > metrics.viewportWidth + 1) {
      failures.push(`horizontal overflow: ${metrics.scrollWidth}px > ${metrics.viewportWidth}px`)
    }
    if (metrics.firstContentfulPaint !== null && metrics.firstContentfulPaint > 1500) {
      failures.push(`first contentful paint ${Math.round(metrics.firstContentfulPaint)}ms > 1500ms`)
    }
    if (metrics.load !== null && metrics.load > 3000) {
      failures.push(`load event ${Math.round(metrics.load)}ms > 3000ms`)
    }

    console.log('Performance metrics:')
    console.log(JSON.stringify(metrics, null, 2))

    if (failures.length > 0) {
      throw new Error(`Performance check failed:\n- ${failures.join('\n- ')}`)
    }
  } finally {
    if (browser) await browser.close()
    if (server) server.kill('SIGTERM')
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
