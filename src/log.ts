import { Logger } from "tslog"
import type { ILogObj } from "tslog"
import { IS_PROD } from "./constants.js"
import type { Middleware } from "koa"

const LogLevels = [
  "SILLY",
  "TRACE",
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR",
  "FATAL",
] as const

export const getLogLevel = (): number => {
  const LOG_LEVEL = process.env["LOG_LEVEL"] as
    | (typeof LogLevels)[number]
    | undefined

  if (LOG_LEVEL === undefined) return LogLevels.indexOf("INFO")

  if (!LogLevels.includes(LOG_LEVEL))
    throw new Error(
      `Unsupported value ${LOG_LEVEL}, must be [${LogLevels.join("|")}]`,
    )

  return LogLevels.indexOf(LOG_LEVEL)
}

export const requestLogger = (): Middleware => async (context, next) => {
  const startTime = Date.now()
  const foo = await next()
  const endTime = Date.now()
  const duration = endTime - startTime

  const { method, url, status, body, length } = context

  // noinspection MagicNumberJS
  if (status >= 500) {
    log.error(`${method} ${url} ${status} ${duration}ms`, {
      duration,
      status,
      method,
      url,
      length,
      parameters: context.request.body,
      errorBody: body?.message,
    })
  } else {
    // noinspection MagicNumberJS
    if (status >= 400) {
      log.warn(`${method} ${url} ${status} ${duration}ms`, {
        duration,
        status,
        method,
        url,
        length,
        parameters: context.request.body,
        errorBody: body?.message,
      })
    } else {
      log.info(`${method} ${url} ${status} ${duration}ms`, {
        duration,
        status,
        method,
        url,
        length,
      })
    }
  }

  return foo
}

export const log = new Logger<ILogObj>({
  type: IS_PROD ? "json" : "pretty",
  minLevel: getLogLevel(),
})
