import { existsSync, readdirSync } from "node:fs"
import { join, relative, sep } from "node:path"

/**
 * @param {string} repoRoot
 * @param {string} group
 * @returns {string[]} absolute paths of the package directories inside `group`
 */
export function listPackageDirectories(repoRoot, group) {
  const groupDirectory = join(repoRoot, group)
  if (!existsSync(groupDirectory)) {
    return []
  }
  return readdirSync(groupDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(groupDirectory, entry.name))
}

/**
 * @param {string} repoRoot
 * @param {string} absolutePath
 * @returns {string} forward-slash path relative to the repo root
 */
export function toRepoRelativePath(repoRoot, absolutePath) {
  return relative(repoRoot, absolutePath).split(sep).join("/")
}
