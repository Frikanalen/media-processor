import Router from "@koa/router"
import { getTusReceiver } from "../receiver/getTusReceiver"
import { ingestVideo } from "./middleware/ingestVideo"

const router = getTusReceiver(new Router(), {
  type: "video",
  onComplete: [ingestVideo()],
})

export { router as videoRouter }
