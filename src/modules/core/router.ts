import Router from "@koa/router"
import { videoRouter } from "../video/router"

const router = new Router()

router.use(videoRouter.middleware())

export { router }
