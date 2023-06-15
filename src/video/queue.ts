import Queue from "bull"
import { url } from "../redis/redis"
import type { VideoJobData } from "./types"
import { process } from "./process"

const queue = new Queue<VideoJobData>("video-processing", url)

queue.process(5, process)
queue.on("failed", console.log)

export { queue as videoQueue }
