import type { Context, Next } from "koa"
import { videoQueue } from "../video/queue.js"
import { PassThrough } from "stream"

const streamEventsMode = async (context: Context) => {
  context.request.socket.setTimeout(0)
  context.req.socket.setNoDelay(true)
  context.req.socket.setKeepAlive(true)

  context.respond = true
  context.status = 200
  context.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  })
  await context.flushHeaders()
}

export const statusUpdate =
  (prefix: string) => async (context: Context, next: Next) => {
    if (!context.path.startsWith(prefix)) return next()
    const jobId = parseInt(context.path.slice(prefix.length + 1))

    if (isNaN(jobId)) {
      context.status = 401
      context.message = "missing jobId"
      return next()
    }

    await streamEventsMode(context)

    const responseStream = new PassThrough()
    context.response.body = responseStream

    const job = await videoQueue.getJob(jobId)
    if (job === null) {
      context.status = 404
      context.message = "job does not exist"
      return next()
    }

    const response = {
      jobId,
      progress: job.progress(),
    }

    responseStream.write("event: name\n")
    responseStream.write(`data: ${JSON.stringify(response)}\n\n`)

    if (await job.finished()) {
      responseStream.end()
    }

    return next()
  }
