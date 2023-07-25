import "dotenv/config"

import { connection } from "./upload/redis/connection.js"
import Koa from "koa"
import bodyParser from "koa-bodyparser"
import { handleError } from "./middleware/handleError.js"
//import { sendCORSDev } from "./middleware/sendCORSDev.js"
import { videoRouter } from "./upload/router.js"
import { log, requestLogger } from "./log.js"
import { FK_API, FK_API_KEY, IS_PROD, SECRET_KEY_HEADER } from "./constants.js"
import { OpenAPI } from "./generated/index.js"
import { statusUpdate } from "./status/router.js"

import { showMetrics } from "./metrics.js"

OpenAPI.BASE = FK_API

OpenAPI.HEADERS = async (r) => {
  return {
    [SECRET_KEY_HEADER]: FK_API_KEY,
    "X-CSRF-Token": r?.cookies?.["fk-csrf"] ?? "",
  }
}
const port = Number(process.env["PORT"]) || 8001

const app = new Koa()

log.info({ IS_PROD })

app.use(requestLogger())
app.use(handleError)
app.use(bodyParser())
//if (!IS_PROD) app.use(sendCORSDev())
app.use(showMetrics)
app.use(videoRouter.prefix("/upload/video").routes())
app.use(statusUpdate("/upload/status"))

async function main() {
  await connection.connect()
  app.listen(port, () => log.info(`media-processor listening on port ${port}`))
}

main().catch(console.error)
