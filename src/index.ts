import "dotenv/config"
import { redis } from "./modules/redis/redis"
import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { logRequest } from "./modules/core/middleware/logRequest"
import { handleError } from "./modules/core/middleware/handleError"
import { sendCORSHeaders } from "./modules/core/middleware/sendCORSHeaders"
import { videoRouter } from "./modules/video/router"
import { log } from "./modules/core/log"
import { FK_API, FK_API_KEY, SECRET_KEY_HEADER } from "./modules/core/constants"

import { OpenAPI } from "./client"

OpenAPI.BASE = FK_API

OpenAPI.HEADERS = async (r) => {
  return {
    [SECRET_KEY_HEADER]: FK_API_KEY,
    "X-CSRF-Token": r?.cookies?.["fk-csrf"] ?? "",
  }
}
const port = Number(process.env.PORT) || 8001

const app = new Koa()

app.use(logRequest())
app.use(handleError())
app.use(bodyParser())
app.use(sendCORSHeaders())
app.use(videoRouter.routes())

async function main() {
  await redis.connect()
  app.listen(port, () => log.info(`media-processor listening on port ${port}`))
}

main().catch(console.error)
