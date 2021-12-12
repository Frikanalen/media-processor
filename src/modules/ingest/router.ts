import Router from "@koa/router"
import { requireSecretKey } from "../auth/middleware/requireSecretKey"
import { sendResource } from "../core/middleware/sendResource"
import { validateSchema } from "../validation/middleware/validateSchema"
import { ingestSchema } from "./schemas/incomingFileSchema"

const router = new Router({
    prefix: "/ingest",
  })

  router.post(
    "/",
    requireSecretKey(),
    validateSchema(ingestSchema),
    sendResource((m) => ({ id: m })),
  )
  
  export { router as ingestRouter }