import Queue from "bull"
import { join } from "path"
import { REDIS_URL } from "../redis/redis"
import { VideoJobData } from "./types"
import { existsSync } from "fs"

// Extension depends on whether I'm using dev server or prod
const tsScript = join(__dirname, "./process.ts")
const jsScript = join(__dirname, "./process.js")

const queue = new Queue<VideoJobData>("video-processing", REDIS_URL)

queue.process(5, existsSync(jsScript) ? jsScript : tsScript)
queue.on("failed", console.log)

export { queue as videoQueue }
