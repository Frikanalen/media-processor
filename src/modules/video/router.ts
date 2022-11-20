import Router from "@koa/router"
import { getTusReceiver } from "../tus/helpers/getTusReceiver"
import { ingestVideo } from "./middleware/ingestVideo"

const router = getTusReceiver(new Router(), {
  type: "video",
  onComplete: [ingestVideo()],
})

export { router as videoRouter }
