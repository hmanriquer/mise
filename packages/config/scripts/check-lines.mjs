import { readFileSync } from "node:fs"
import { join } from "node:path"
import { findViolations } from "./lib/line-limits.mjs"
import { readSourceFiles } from "./lib/source-files.mjs"
import { listPackageDirectories, toRepoRelativePath } from "./lib/workspace.mjs"

const REPO_ROOT = process.cwd()
const EXIT_FAILURE = 1
const SOURCE_SUBFOLDERS_BY_GROUP = {
  apps: ["src", "scripts", "e2e", "__tests__"],
  packages: ["src", "scripts", "__tests__"],
}

function collectSourceRoots() {
  return Object.entries(SOURCE_SUBFOLDERS_BY_GROUP).flatMap(([group, subfolders]) =>
    listPackageDirectories(REPO_ROOT, group).flatMap((packageDirectory) =>
      subfolders.map((subfolder) => join(packageDirectory, subfolder)),
    ),
  )
}

function main() {
  const files = collectSourceRoots().flatMap((root) => readSourceFiles(root))
  const sourceFiles = files.map((absolutePath) => ({
    path: toRepoRelativePath(REPO_ROOT, absolutePath),
    text: readFileSync(absolutePath, "utf8"),
  }))
  const violations = findViolations(sourceFiles)

  for (const { path, lines, limit } of violations) {
    console.error(`${path}: ${lines} non-blank lines (limit ${limit})`)
  }
  if (violations.length > 0) {
    process.exit(EXIT_FAILURE)
  }
  console.log(`check:lines OK (${sourceFiles.length} files within limits)`)
}

main()
