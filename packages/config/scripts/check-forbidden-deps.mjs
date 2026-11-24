import { readFileSync } from "node:fs"
import { join } from "node:path"
import { findForbiddenDependencies } from "./lib/forbidden-deps.mjs"
import { listPackageDirectories, toRepoRelativePath } from "./lib/workspace.mjs"

const REPO_ROOT = process.cwd()
const EXIT_FAILURE = 1
const MANIFEST_FILE = "package.json"
const WORKSPACE_GROUPS = ["apps", "packages"]

function collectManifestPaths() {
  const workspaceManifests = WORKSPACE_GROUPS.flatMap((group) =>
    listPackageDirectories(REPO_ROOT, group).map((directory) => join(directory, MANIFEST_FILE)),
  )
  return [join(REPO_ROOT, MANIFEST_FILE), ...workspaceManifests]
}

function main() {
  const manifests = collectManifestPaths().map((absolutePath) => ({
    path: toRepoRelativePath(REPO_ROOT, absolutePath),
    json: JSON.parse(readFileSync(absolutePath, "utf8")),
  }))
  const hits = findForbiddenDependencies(manifests)

  for (const { path, name } of hits) {
    console.error(`${path}: forbidden dependency "${name}"`)
  }
  if (hits.length > 0) {
    process.exit(EXIT_FAILURE)
  }
  console.log(`check:deps OK (${manifests.length} manifests checked)`)
}

main()
