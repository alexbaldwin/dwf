import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const port = process.env.PERF_PORT || '3100'
const url = process.env.PERF_URL || `http://127.0.0.1:${port}`
const ownsServer = !process.env.PERF_URL
const timeoutMs = 120_000
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 }
]

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
      // The production server is still starting.
    }
    await sleep(500)
  }
  throw new Error(`Timed out waiting for ${targetUrl}`)
}

function startServer() {
  const child = spawn('corepack', ['pnpm', 'exec', 'next', 'start', '-p', port], {
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

async function observeWebVitals(page) {
  await page.addInitScript(() => {
    window.__dwfVitals = { largestContentfulPaint: 0, cumulativeLayoutShift: 0 }
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      window.__dwfVitals.largestContentfulPaint = entries.at(-1)?.startTime || 0
    }).observe({ type: 'largest-contentful-paint', buffered: true })
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__dwfVitals.cumulativeLayoutShift += entry.value
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

async function measureViewport(browser, viewport) {
  const page = await browser.newPage({ viewport })
  await observeWebVitals(page)
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(350)

  const portrait = page.locator('img[alt="Portrait of Alex Baldwin"]')
  await portrait.waitFor({ state: 'visible' })
  await portrait.evaluate((element) => element.decode().catch(() => undefined))
  await page.screenshot({ path: `.perf/home-${viewport.name}.png`, fullPage: false })

  const metrics = await page.evaluate(({ isDesktop }) => {
    const navigation = performance.getEntriesByType('navigation')[0]
    const paints = Object.fromEntries(
      performance.getEntriesByType('paint').map((entry) => [entry.name, entry.startTime])
    )
    const image = document.querySelector('img[alt="Portrait of Alex Baldwin"]')
    const elements = Array.from(document.querySelectorAll('[data-window], [data-region]'))
      .filter((element) => {
        const style = window.getComputedStyle(element)
        return style.display !== 'none' && style.visibility !== 'hidden'
      })
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          name: element.dataset.window || element.dataset.region,
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom
        }
      })

    const overlaps = []
    for (let index = 0; index < elements.length; index += 1) {
      for (let comparison = index + 1; comparison < elements.length; comparison += 1) {
        const first = elements[index]
        const second = elements[comparison]
        const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left))
        const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top))
        if (width * height > 1) overlaps.push(`${first.name}/${second.name}`)
      }
    }

    const outOfBounds = elements
      .filter(({ name }) => !['hero', 'footer', 'window-dock'].includes(name))
      .filter((rect) =>
        rect.left < -1 ||
        rect.right > window.innerWidth + 1 ||
        (isDesktop && (rect.top < -1 || rect.bottom > window.innerHeight + 1))
      )
      .map(({ name }) => name)

    return {
      domContentLoaded: navigation?.domContentLoadedEventEnd ?? null,
      load: navigation?.loadEventEnd ?? null,
      firstContentfulPaint: paints['first-contentful-paint'] ?? null,
      largestContentfulPaint: window.__dwfVitals?.largestContentfulPaint ?? null,
      cumulativeLayoutShift: window.__dwfVitals?.cumulativeLayoutShift ?? null,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      imageLoaded: Boolean(image?.complete && image.naturalWidth > 0),
      overlaps,
      outOfBounds
    }
  }, { isDesktop: viewport.name === 'desktop' })

  await page.close()
  return metrics
}

function getFailures(viewport, metrics) {
  const failures = []
  if (!metrics.imageLoaded) failures.push('portrait image did not finish loading')
  if (metrics.scrollWidth > metrics.viewportWidth + 1) {
    failures.push(`horizontal overflow: ${metrics.scrollWidth}px > ${metrics.viewportWidth}px`)
  }
  if (metrics.overlaps.length > 0) failures.push(`overlapping surfaces: ${metrics.overlaps.join(', ')}`)
  if (metrics.outOfBounds.length > 0) failures.push(`out-of-bounds windows: ${metrics.outOfBounds.join(', ')}`)
  if (metrics.firstContentfulPaint === null || metrics.firstContentfulPaint > 1500) {
    failures.push(`FCP ${Math.round(metrics.firstContentfulPaint || 0)}ms is missing or above 1500ms`)
  }
  if (metrics.largestContentfulPaint === null || metrics.largestContentfulPaint > 2500) {
    failures.push(`LCP ${Math.round(metrics.largestContentfulPaint || 0)}ms is missing or above 2500ms`)
  }
  if (metrics.cumulativeLayoutShift === null || metrics.cumulativeLayoutShift > 0.1) {
    failures.push(`CLS ${metrics.cumulativeLayoutShift ?? 'missing'} is missing or above 0.1`)
  }
  if (metrics.load === null || metrics.load > 3000) {
    failures.push(`load ${Math.round(metrics.load || 0)}ms is missing or above 3000ms`)
  }
  return failures.map((failure) => `${viewport.name}: ${failure}`)
}

async function run() {
  const server = ownsServer ? startServer() : null
  let browser

  try {
    await (server
      ? Promise.race([waitForServer(url, timeoutMs), waitForServerExit(server)])
      : waitForServer(url, timeoutMs))
    browser = await chromium.launch()
    await mkdir('.perf', { recursive: true })

    const results = {}
    const failures = []
    for (const viewport of viewports) {
      const metrics = await measureViewport(browser, viewport)
      results[viewport.name] = metrics
      failures.push(...getFailures(viewport, metrics))
    }

    console.log('Production performance metrics:')
    console.log(JSON.stringify(results, null, 2))
    if (failures.length > 0) throw new Error(`Performance check failed:\n- ${failures.join('\n- ')}`)
  } finally {
    if (browser) await browser.close()
    if (server) server.kill('SIGTERM')
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
