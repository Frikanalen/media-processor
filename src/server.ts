import "dotenv/config"

import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { handleError } from "./middleware/handleError.js"
import { log, requestLogger } from "./log.js"
import { FK_API, FK_API_KEY, IS_PROD, SECRET_KEY_HEADER } from "./config.js"
import { OpenAPI } from "./generated/index.js"
import { jobStatusRouter } from "./status/router.js"

import { metricsRouter } from "./metrics.js"
import { sendCORSDev } from "./middleware/sendCORSDev.js"
import { uploadHookRouter } from "./tusHook/router.js"

OpenAPI.BASE = FK_API

OpenAPI.HEADERS = async (r) => {
  return {
    [SECRET_KEY_HEADER]: FK_API_KEY,
    "X-CSRF-Token": r?.cookies?.["fk-csrf"] ?? "",
  }
}
// Defining port numbers for the public-facing and internal applications
const publicPort = Number(process.env["PORT"]) || 8001
const internalPort = Number(process.env["INTERNAL_PORT"]) || 8002

// Instantiating Koa for the public-facing application
const appPublic = new Koa()

// Instantiating Koa for the internal application
const appInternal = new Koa()

// Setting up middleware for the public-facing application
appPublic.use(requestLogger())
appPublic.use(handleError)
appPublic.use(bodyParser())
if (!IS_PROD) {
  log.warn("Dev mode: Enabling CORS for localhost")
  appPublic.use(sendCORSDev())
}
appPublic.use(jobStatusRouter.prefix("/status").routes()) // public-facing routes

// Setting up middleware for the internal application
appInternal.use(requestLogger())
appInternal.use(handleError)
appInternal.use(bodyParser())
appInternal.use(metricsRouter.prefix("/metrics").routes())
appInternal.use(uploadHookRouter.prefix("/tusd-hooks").routes())

async function main() {
  log.info(`starting services`)

  appPublic.listen(publicPort, () =>
    log.info(`public API listening on :${publicPort}`),
  )

  appInternal.listen(internalPort, () =>
    log.info(`internal API listening on :${internalPort}`),
  )
}

main().catch(console.error)
