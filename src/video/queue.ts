import Queue from "bull"
import { url } from "../receiver/redis/connection.js"
import type { VideoJobData } from "./types.js"
import { process } from "./process.js"

const queue = new Queue<VideoJobData>("video-processing", url)

queue.process(5, process)
queue.on("failed", console.log)

export { queue as videoQueue }
