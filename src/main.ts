import * as core from '@actions/core'
import { measure, checkBuildDir, delta, percent } from './bundle-size.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const currentPath: string = core.getInput('current-path') || process.cwd()
    const basePath: string = core.getInput('base-path')
    const fmt = (bytes: number) => (bytes / 1048576).toFixed(2) + ' MB'
    const tableData = [
      [
        { data: 'Asset', header: true },
        { data: 'Base', header: true },
        { data: 'PR', header: true },
        { data: 'Delta', header: true }
      ]
    ]

    // Compute current bundle size
    checkBuildDir(currentPath)
    const currentJS = measure(currentPath, '.js')
    const currentCSS = measure(currentPath, '.css')
    core.setOutput('current-js', fmt(currentJS.raw))
    core.setOutput('current-css', fmt(currentCSS.raw))
    core.setOutput('current-js-gz', fmt(currentJS.gz))
    core.setOutput('current-css-gz', fmt(currentCSS.gz))

    // Compute base bundle size
    checkBuildDir(basePath)
    const baseJS = measure(basePath, '.js')
    const baseCSS = measure(basePath, '.css')
    core.setOutput('base-js', fmt(baseJS.raw))
    core.setOutput('base-css', fmt(baseCSS.raw))
    core.setOutput('base-js-gz', fmt(baseJS.gz))
    core.setOutput('base-css-gz', fmt(baseCSS.gz))

    // Fill the summary table
    tableData.push([
      { data: 'JS(raw)', header: false },
      { data: fmt(baseJS.raw), header: false },
      { data: fmt(currentJS.raw), header: false },
      {
        data: `${delta(baseJS.raw, currentJS.raw)}(${percent(baseJS.raw, currentJS.raw)})`,
        header: false
      }
    ])
    tableData.push([
      { data: 'JS(gzip)', header: false },
      { data: fmt(baseJS.gz), header: false },
      { data: fmt(currentJS.gz), header: false },
      {
        data: `${delta(baseJS.gz, currentJS.gz)}(${percent(baseJS.gz, currentJS.gz)})`,
        header: false
      }
    ])
    tableData.push([
      { data: 'CSS(raw)', header: false },
      { data: fmt(baseCSS.raw), header: false },
      { data: fmt(currentCSS.raw), header: false },
      {
        data: `${delta(baseCSS.raw, currentCSS.raw)}(${percent(baseCSS.raw, currentCSS.raw)})`,
        header: false
      }
    ])
    tableData.push([
      { data: 'CSS(gzip)', header: false },
      { data: fmt(baseCSS.gz), header: false },
      { data: fmt(currentCSS.gz), header: false },
      {
        data: `${delta(baseCSS.gz, currentCSS.gz)}(${percent(baseCSS.gz, currentCSS.gz)})`,
        header: false
      }
    ])
    core.summary.addTable(tableData)
    core.summary.write()
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
