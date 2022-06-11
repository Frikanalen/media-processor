import Queue from "bull"
import { REDIS_URL } from "../redis/redis"
import { VideoJobData } from "./types"
import { process } from "./process"

const queue = new Queue<VideoJobData>("video-processing", REDIS_URL)

queue.process(5, process)
queue.on("failed", console.log)

export { queue as videoQueue }
