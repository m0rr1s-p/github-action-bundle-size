import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

// Formatter
const fmt = (bytes: number) => (bytes / 1048576).toFixed(2) + ' MB'

/**
 * Recursively collects all files with a specific extension from a given directory.
 *
 * @param {string} dir - The directory to search for files.
 * @param {string} ext - The file extension to filter for.
 * @return {string[]} An array of file paths that match the specified extension.
 */
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

/**
 * Measures the raw and gzipped sizes of files with a specified extension in a given directory.
 *
 * @param {string} buildDir - The path to the directory containing the files to be measured.
 * @param {string} ext - The file extension to filter files by for measurement.
 * @return {{raw: number, gz: number}} An object containing the raw size (in bytes) of all matching files and the size of their gzipped content.
 */
export function measure(buildDir: string, ext: string) {
  const files = collectFiles(buildDir, ext)
  const raw = files.reduce((sum, f) => sum + statSync(f).size, 0)
  const buf = Buffer.concat(files.map((f) => readFileSync(f)))
  const gz = gzipSync(buf, { level: 9 }).length
  return { raw, gz }
}

/**
 * Checks if the specified build directory exists. If the directory does not exist,
 * it logs an error message and exits the process.
 *
 * @param {string} buildDir - The path to the build directory to be checked.
 * @return {void} This function does not return any value.
 */
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

/**
 * Calculates the difference between two numbers and formats it as a string.
 *
 * @param base The base number to compare against.
 * @param pr The number being compared to the base.
 * @return A formatted string representing the difference:
 *         "--" if the difference is zero, a positive formatted string if
 *         the difference is greater than zero, and a negative formatted
 *         string if the difference is less than zero.
 */
export function delta(base: number, pr: number) {
  const diff = pr - base
  if (diff === 0) {
    return '--'
  } else if (diff > 0) {
    return `+${fmt(diff)}`
  } else {
    return `${fmt(diff)}`
  }
}

/**
 * Calculates the percentage difference between a base value and a given value.
 *
 * @param {number} base - The base value to compare against.
 * @param {number} pr - The value to calculate the percentage difference for.
 * @return {string} The percentage difference formatted as a string with a '%' symbol.
 */
export function percent(base: number, pr: number) {
  const diff = pr - base
  if (diff === 0) {
    return '0%'
  } else {
    return `${((diff / base) * 100).toFixed(1)}%`
  }
}
