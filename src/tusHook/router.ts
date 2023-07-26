import Router from "@koa/router"
import { authenticate } from "../middleware/authenticate"
import type { UploadHookState } from "./types"
import { ingest } from "./handlers/ingest"
import { register } from "./handlers/register"
import { analyze } from "./handlers/analyze"
import { parseRequest } from "./helpers/parseRequest"
import { store } from "./handlers/store"
import { log } from "../log"

// HTTP hooks for tusd
const uploadHookRouter = new Router<UploadHookState>()

uploadHookRouter.use(async (ctx, next) => {
  log.info(`Request: ${ctx.method} ${ctx.path}`)
  log.info(`Request headers: ${JSON.stringify(ctx.request.headers, null, 2)}`)
  log.info(`Request body: ${JSON.stringify(ctx.request.body, null, 2)}`)

  await next()
  log.info(`Response: HTTP ${ctx.status}: ${JSON.stringify(ctx.body, null, 2)}`)
})
uploadHookRouter.use(parseRequest)
uploadHookRouter.use(
  authenticate({
    required: true,
    cookieGetter: (ctx) => ctx.state.cookie,
  }),
)

uploadHookRouter.post("/", analyze, store, register, ingest)

export { uploadHookRouter }
