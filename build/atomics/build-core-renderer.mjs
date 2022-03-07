import buildRenderer from './build-renderer.mjs'

/**
 * @param {NodeJS.ProcessVersions} versions
 */
export default (versions) => buildRenderer(versions, options => {
  options.root = 'renderer'
  options.define.__VUE_OPTIONS_API__ = JSON.stringify(false)
  return options
})