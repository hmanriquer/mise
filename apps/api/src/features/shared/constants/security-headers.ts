// The API only returns JSON, so nothing it serves may load, run or be framed.
const NONE = "'none'"

export const API_CONTENT_SECURITY_POLICY = {
  defaultSrc: [NONE],
  frameAncestors: [NONE],
  baseUri: [NONE],
  formAction: [NONE],
}
