import Router from "@koa/router"
import { getTusReceiver } from "../receiver/getTusReceiver.js"
import { ingestVideo } from "./middleware/ingestVideo.js"

const router = getTusReceiver(new Router(), {
  onComplete: ingestVideo,
})

export { router as videoRouter }
