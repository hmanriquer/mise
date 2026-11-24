import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".mjs", ".js"]
const SKIPPED_DIRECTORIES = new Set(["node_modules", "dist"])

/**
 * @param {string} directory
 * @returns {string[]} absolute paths of source files below `directory`
 */
export function readSourceFiles(directory) {
  if (!existsSync(directory)) {
    return []
  }
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      return SKIPPED_DIRECTORIES.has(entry.name) ? [] : readSourceFiles(entryPath)
    }
    return SOURCE_EXTENSIONS.some((extension) => entry.name.endsWith(extension)) ? [entryPath] : []
  })
}
