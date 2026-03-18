import { describe, expect, it } from '@jest/globals'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { delta, measure, percent } from '../src/bundle-size.js'

describe('bundle-size helpers', () => {
  it('delta returns -- for unchanged values', () => {
    expect(delta(100, 100)).toBe('--')
  })

  it('delta returns a positive formatted diff', () => {
    expect(delta(100, 200)).toBe('+0.00 MB')
  })

  it('delta returns a negative formatted diff', () => {
    expect(delta(200, 100)).toBe('-0.00 MB')
  })

  it('percent returns 0% when values are equal', () => {
    expect(percent(100, 100)).toBe('0%')
  })

  it('percent returns a percentage string', () => {
    expect(percent(100, 150)).toBe('50.0%')
  })

  it('measure sums matching files and ignores maps', () => {
    const dir = './__tests__/mocks'
    writeFileSync(join(dir, 'a.js.map'), 'ignored')
    const resultJS = measure(dir, '.js')
    const resultCSS = measure(dir, '.css')
    expect(resultJS.raw).toBeGreaterThan(0)
    expect(resultJS.gz).toBeGreaterThan(0)
    expect(resultJS.raw).toBeGreaterThan(resultJS.gz)
    expect(resultCSS.raw).toBeGreaterThan(0)
    expect(resultCSS.gz).toBeGreaterThan(0)
    expect(resultCSS.raw).toBeGreaterThan(resultCSS.gz)
  })
})
