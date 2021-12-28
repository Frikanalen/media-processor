import Queue from "bull"
import { join } from "path"
import { REDIS_URL } from "../redis/redis"
import { VideoJobData } from "./types"

const queue = new Queue<VideoJobData>("video-processing", REDIS_URL)

queue.process(5, join(__dirname, "./processor.js"))
queue.on("failed", console.log)

export { queue as videoQueue }
