export const statusCodes = {
  notFound: 404,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  conflict: 409,
  gone: 410,
  internalServerError: 500,
} as const

export const reasonToCodeMap: Record<HttpStatus, string> = {
  "400": "Bad Request",
  "401": "Unauthorized",
  "403": "Forbidden",
  "404": "Not Found",
  "409": "Conflict",
  "410": "Gone",
  "500": "Internal Server Error",
}

export type HttpStatus = (typeof statusCodes)[keyof typeof statusCodes]

export class HttpError extends Error {
  public reason: string
  public details?: object

  constructor(
    public code: HttpStatus,
    customReason?: string,
    details?: object | string
  ) {
    super()

    this.details = typeof details === "string" ? { code: details } : details!
    this.reason = customReason || reasonToCodeMap[code]
  }
}
