import "dotenv/config"

import { redis } from "./redis/redis"
import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { logRequest } from "./core/middleware/logRequest"
import { handleError } from "./core/middleware/handleError"
import { sendCORSDev } from "./core/middleware/sendCORSDev"
import { videoRouter } from "./video/router"
import { log } from "./core/log"
import {
  FK_API,
  FK_API_KEY,
  IS_PROD,
  SECRET_KEY_HEADER,
} from "./core/constants"
import { OpenAPI } from "./generated"
import { statusUpdate } from "./status/router"

import { showMetrics } from "./core/metrics"

OpenAPI.BASE = FK_API

OpenAPI.HEADERS = async (r) => {
  return {
    [SECRET_KEY_HEADER]: FK_API_KEY,
    "X-CSRF-Token": r?.cookies?.["fk-csrf"] ?? "",
  }
}
const port = Number(process.env["PORT"]) || 8001

const app = new Koa()

app.use(logRequest())
app.use(handleError())
app.use(bodyParser())
if (!IS_PROD) app.use(sendCORSDev())
app.use(showMetrics)
app.use(videoRouter.prefix("/upload/video").routes())
app.use(statusUpdate("/upload/status"))

async function main() {
  await redis.connect()
  app.listen(port, () => log.info(`media-processor listening on port ${port}`))
}

main().catch(console.error)
