import { Middleware } from "koa"
import chalk from "chalk"

const methodToColorMap: Record<string, typeof chalk.Color> = {
  options: "greenBright",
  head: "grey",
  get: "blue",
  post: "yellow",
  put: "yellow",
  delete: "redBright",
}

const leadingZero = (v: number, length = 2) =>
  v.toString().padStart(length, "0")
const padCenter = (str: string, length: number) =>
  str.padStart((str.length + length) / 2).padEnd(length)

export const logRequest = (): Middleware => async (context, next) => {
  const start = Date.now()
  await next()
  const now = new Date()
  const difference = Date.now() - start

  const { method, path, querystring } = context
  const methodColor = methodToColorMap[method.toLowerCase()] ?? "white"

  const responseTime = chalk[difference > 500 ? "redBright" : "gray"](
    `(${leadingZero(difference, 3)}ms)`
  )

  const time = chalk.gray(
    `${leadingZero(now.getHours())}:${leadingZero(
      now.getMinutes()
    )}:${leadingZero(now.getSeconds())} ${responseTime}`
  )

  const separator = chalk.gray(" ◦ ")
  const coloredMethod = chalk[methodColor](padCenter(method.toUpperCase(), 6))
  const coloredPath = chalk.white(path)
  const coloredQueryString = querystring
    ? chalk.magentaBright("?" + querystring)
    : ""

  console.log(
    `${time}${separator}${coloredMethod}${separator}${context.status}${separator}${coloredPath}${coloredQueryString}`
  )
}
