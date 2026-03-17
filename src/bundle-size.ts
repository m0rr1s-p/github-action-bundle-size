import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

// uses cwd() instead of import.meta.dirname so the CI workflow can copy this
// script to /tmp and run it against the base branch (where the file doesn't exist).
// TODO: once preepic merges to main, both branches will have the script —
//       switch back to import.meta.dirname and use `pnpm lint:bundle-size:ci` for both.
// const BUILD_DIR = join(process.cwd(), '../resources/assets/svelte/build')
const fmt = (bytes: number) => (bytes / 1048576).toFixed(2) + ' MB'
function collectFiles(dir: string, ext: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, ext))
    } else if (entry.name.endsWith(ext) && !entry.name.endsWith('.map')) {
      results.push(full)
    }
  }
  return results
}

export function measure(buildDir: string, ext: string) {
  const files = collectFiles(buildDir, ext)
  const raw = files.reduce((sum, f) => sum + statSync(f).size, 0)
  const buf = Buffer.concat(files.map((f) => readFileSync(f)))
  const gz = gzipSync(buf, { level: 9 }).length
  return { raw, gz }
}

export function checkBuildDir(buildDir: string) {
  try {
    statSync(buildDir)
  } catch {
    console.error(
      `Build directory not found: ${buildDir}\nRun 'pnpm build' first.`
    )
    process.exit(1)
  }
}

export function delta(base: number, pr: number) {
  const diff = pr - base
  if (diff === 0) {
    return '--'
  } else if (diff > 0) {
    return `+${fmt(diff)}`
  } else {
    return `-${fmt(diff)}`
  }
}

export function percent(base: number, pr: number) {
  const diff = pr - base
  if (diff === 0) {
    return '0%'
  } else {
    return `${((diff / base) * 100).toFixed(1)}%`
  }
}

// const js = measure('.js')
// const css = measure('.css')

//
// const args = process.argv.slice(2).filter((a) => a !== '--')
// const mode = args[0]

// if (mode === '--env') {
//   const prefix = args[1] || 'BUNDLE'
//   console.log(`${prefix}_JS=${js.raw}`)
//   console.log(`${prefix}_CSS=${css.raw}`)
//   console.log(`${prefix}_JS_GZ=${js.gz}`)
//   console.log(`${prefix}_CSS_GZ=${css.gz}`)
// } else {
//   console.log('Bundle Size')
//   console.log('')
//   console.log(`  JS   ${fmt(js.raw)}  (gzip: ${fmt(js.gz)})`)
//   console.log(`  CSS  ${fmt(css.raw)}  (gzip: ${fmt(css.gz)})`)
// }
