import * as core from '@actions/core'
import { measure, checkBuildDir } from './bundle-size.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const currentPath: string = core.getInput('current-path') || process.cwd()
    const basePath: string = core.getInput('base-path')

    // Compute current bundle size
    checkBuildDir(currentPath)
    const currentJS = measure(currentPath, '.js')
    const currentCSS = measure(currentPath, '.css')
    core.setOutput('current-js', currentJS.raw)
    core.setOutput('current-css', currentCSS.raw)
    core.setOutput('current-js-gz', currentJS.gz)
    core.setOutput('current-css-gz', currentCSS.gz)

    // Compute base bundle size
    checkBuildDir(basePath)
    const baseJS = measure(basePath, '.js')
    const baseCSS = measure(basePath, '.css')
    core.setOutput('base-js', baseJS.raw)
    core.setOutput('base-css', baseCSS.raw)
    core.setOutput('base-js-gz', baseJS.gz)
    core.setOutput('base-css-gz', baseCSS.gz)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
