import Router from "@koa/router"
import { ingestRouter } from "../ingest/router"
import { videoRouter } from "../video/router"

const router = new Router()

router.use(ingestRouter.middleware())
router.use(videoRouter.middleware())

export { router }
