import { redis } from "./modules/redis/redis.js"
import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { logRequest } from "./modules/core/middleware/logRequest.js"
import { handleError } from "./modules/core/middleware/handleError.js"
import { sendCORSHeaders } from "./modules/core/middleware/sendCORSHeaders.js"
import { videoRouter } from "./modules/video/router.js"
import { log } from "./modules/core/log.js"
import {
  FK_API,
  FK_API_KEY,
  SECRET_KEY_HEADER,
} from "./modules/core/constants.js"
import { OpenAPI } from "./client"
import { statusUpdate } from "./modules/status/router.js"

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
app.use(sendCORSHeaders())
app.use(videoRouter.prefix("/upload/video").routes())
app.use(statusUpdate("/upload/status"))

async function main() {
  await redis.connect()
  app.listen(port, () => log.info(`media-processor listening on port ${port}`))
}

main().catch(console.error)
