import Queue from "bull"
import { VideoJobData } from "./types"

const queue = new Queue<VideoJobData>("video-processing")

queue.process(5, "../processor.ts")

export { queue as videoQueue }
