import { getTusRouter } from "../tus/helpers/getTusRouter"

const router = getTusRouter({
  type: "video",
  afterUploadMiddleware: [],
})

export { router as videoRouter }
