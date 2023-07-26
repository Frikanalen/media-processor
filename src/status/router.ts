import type { Context, Next } from "koa"
import { PassThrough } from "stream"

const streamEventsMode = async (ctx: Context) => {
  ctx.request.socket.setTimeout(0)
  ctx.req.socket.setNoDelay(true)
  ctx.req.socket.setKeepAlive(true)

  ctx.respond = true
  ctx.status = 200
  ctx.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  })
  await ctx.flushHeaders()
}

/**
 * HTTP Event Stream showing the progress of the encoding job
 *
 * @param prefix URL prefix
 * @deprecated The code as it stands is vestigial and should be replaced
 */
export const statusUpdate =
  (prefix: string) => async (ctx: Context, next: Next) => {
    if (!ctx.path.startsWith(prefix)) return next()
    const jobId = parseInt(ctx.path.slice(prefix.length + 1))

    if (isNaN(jobId)) return ctx.throw(401, "missing_or_invalid_jobid")

    await streamEventsMode(ctx)

    ctx.response.body = new PassThrough()

    //const job = await videoQueue.getJob(`${jobId}`)
    //if (!job) return ctx.throw(404, "job_does_not_exist")
    //
    //const response = {
    //  jobId,
    //  progress: job.progress(),
    //}
    //
    //responseStream.write("event: name\n")
    //responseStream.write(`data: ${JSON.stringify(response)}\n\n`)
    //
    //if (await job) responseStream.end()

    return next()
  }
