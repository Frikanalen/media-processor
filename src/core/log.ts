import { Logger } from "tslog"
import { IS_PROD } from "./constants"

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
      `Unsupported value ${LOG_LEVEL}, must be [${LogLevels.join("|")}]`
    )

  return LogLevels.indexOf(LOG_LEVEL)
}

export const log = new Logger({
  type: IS_PROD ? "json" : "pretty",
  minLevel: getLogLevel(),
})
