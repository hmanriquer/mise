export const HTTP_STATUS = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  conflict: 409,
  gone: 410,
  tooManyRequests: 429,
  internalServerError: 500,
} as const
