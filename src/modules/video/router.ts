import Router from "@koa/router"
import { getTusReceiver } from "../tus/helpers/getTusReceiver.js"
import { ingestVideo } from "./middleware/ingestVideo.js"

const router = getTusReceiver(new Router(), {
  type: "video",
  onComplete: [ingestVideo()],
})

export { router as videoRouter }
