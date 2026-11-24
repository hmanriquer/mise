/**
 * @typedef {{ dependencies?: Record<string, string>, devDependencies?: Record<string, string>, peerDependencies?: Record<string, string>, optionalDependencies?: Record<string, string> }} PackageManifestJson
 * @typedef {{ path: string, json: PackageManifestJson }} PackageManifest
 * @typedef {{ path: string, name: string }} ForbiddenDependency
 */

export const FORBIDDEN_DEPENDENCY_PATTERN = /radix|lucide/i

/** @type {ReadonlyArray<keyof PackageManifestJson>} */
const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
]

/**
 * @param {PackageManifest[]} manifests
 * @returns {ForbiddenDependency[]}
 */
export function findForbiddenDependencies(manifests) {
  return manifests.flatMap(({ path, json }) =>
    DEPENDENCY_FIELDS.flatMap((field) =>
      Object.keys(json[field] ?? {})
        .filter((name) => FORBIDDEN_DEPENDENCY_PATTERN.test(name))
        .map((name) => ({ path, name })),
    ),
  )
}
