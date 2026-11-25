/**
 * Verifies the packed tarball in a real Chromium page.
 *
 * Why it exists: the unit suite imports from `src/`, so only an installed package
 * proves that a browser bundler resolves `memory-card` to the web build through the
 * published `exports` map. It owns the browser half of `npm-pack-testing.sh`.
 * Boundary: it needs the installed package directory as its only argument and
 * borrows esbuild and Playwright from this repository.
 */
import * as assert from 'node:assert/strict'

import { build } from 'esbuild'
import { chromium } from 'playwright'

const directory = process.argv[2]
assert.ok(directory, 'usage: npm-pack-browser-testing.ts <installed package directory>')

// esbuild with platform=browser activates the `browser` condition, as Vite,
// webpack, and Cloudflare Workers tooling do.
const bundle = await build({
  absWorkingDir: directory,
  stdin: {
    contents: `
      import * as root from 'memory-card'
      import * as web from 'memory-card/browser'
      window.api = { root, web }
    `,
    resolveDir: directory,
  },
  bundle: true,
  platform: 'browser',
  format: 'iife',
  write: false,
  logLevel: 'silent',
})
const code = bundle.outputFiles[0]?.text
assert.ok(code, 'esbuild produced no output')

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto('about:blank')
  await page.addScriptTag({ content: code })
  const result = await page.evaluate(async () => {
    const { root, web } = (window as any).api
    const card = new root.MemoryCard()
    await card.load()
    await card.set('packed-key', 'packed-value')
    const val = await card.get('packed-key')
    const size = await card.size

    const errors: Record<string, string> = {}
    try {
      const fileCard = new root.MemoryCard({
        name: 'test-file',
        storageOptions: { type: 'file' },
      })
      await fileCard.load()
    } catch (e) {
      errors['file'] = String(e)
    }

    return {
      names: Object.keys(root).sort(),
      sameAsBrowserSubpath: root.MemoryCard === web.MemoryCard,
      val,
      size,
      version: root.VERSION,
      errors,
      nodeGlobals: ['process', 'Buffer'].filter(name => name in window),
    }
  })

  assert.deepEqual(result.names, ['MemoryCard', 'StorageBackend', 'VERSION', 'default', 'log'])
  assert.ok(result.sameAsBrowserSubpath, 'the root should resolve to memory-card/browser in a browser bundle')
  assert.equal(result.val, 'packed-value')
  assert.equal(result.size, 1)
  assert.notEqual(result.version, '0.0.0', 'the pack workflow should stamp the release version')
  assert.deepEqual(result.nodeGlobals, [], 'the web build must not need Node globals')
  assert.match(result.errors['file'] ?? '', /not supported in browser environment/)
  console.log('Chromium: packed web build verified')
} finally {
  await browser.close()
}
