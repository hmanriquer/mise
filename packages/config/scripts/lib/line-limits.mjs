/**
 * @typedef {{ path: string, text: string }} SourceFile
 * @typedef {{ path: string, lines: number, limit: number }} LineViolation
 */

export const COMPONENT_MAX_LINES = 150
export const FILE_MAX_LINES = 200

const EXEMPT_PATH_PATTERNS = [/(^|\/)packages\/ui\/src\/components\//, /\.gen\.[cm]?[jt]sx?$/]
const TEST_PATH_PATTERN = /(^|\/)__tests__\/|\.(test|spec)\.[cm]?[jt]sx?$/
const COMPONENT_FILE_PATTERN = /\.tsx$/

/**
 * @param {string} text
 * @returns {number}
 */
export function countNonBlankLines(text) {
  return text.split("\n").filter((line) => line.trim() !== "").length
}

/**
 * @param {string} path
 * @returns {number | null} null when the file is exempt from the check
 */
export function lineLimitFor(path) {
  if (EXEMPT_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
    return null
  }
  if (TEST_PATH_PATTERN.test(path)) {
    return FILE_MAX_LINES
  }
  return COMPONENT_FILE_PATTERN.test(path) ? COMPONENT_MAX_LINES : FILE_MAX_LINES
}

/**
 * @param {SourceFile[]} files
 * @returns {LineViolation[]}
 */
export function findViolations(files) {
  return files.flatMap(({ path, text }) => {
    const limit = lineLimitFor(path)
    if (limit === null) {
      return []
    }
    const lines = countNonBlankLines(text)
    return lines > limit ? [{ path, lines, limit }] : []
  })
}
