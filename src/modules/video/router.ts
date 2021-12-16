import { getTusRouter } from "../tus/helpers/getTusRouter"
import { ingestVideo } from "./middleware/ingestVideo"

const router = getTusRouter({
  type: "video",
  afterUploadMiddleware: [ingestVideo],
})

export { router as videoRouter }
