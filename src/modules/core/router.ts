import Router from "@koa/router"
import { ingestRouter } from "../ingest/router"

const router = new Router()

router.use(ingestRouter.middleware())

export { router }