import Queue from "bull"
import { join } from "path"
import { VideoJobData } from "./types"

const queue = new Queue<VideoJobData>("video-processing")

queue.process(5, join(__dirname, "./processor.js"))

export { queue as videoQueue }
