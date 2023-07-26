import type { Transform } from "stream"
import { log } from "../log"

type EventName = "status" | "progress" | "completed" | "failed"

type StatusMessage = {
  event: EventName
  data: any
}
export const writeEvent = (
  client: Transform,
  { data, event }: StatusMessage,
) => {
  client.write(`event: ${event}\r\n`)
  client.write(`data: ${JSON.stringify(data)}\r\n\r\n`)
}
class StatusMessageBroker {
  private static instance: StatusMessageBroker
  private clients: Record<string, Transform[]> = {}
  private constructor() {}
  public static getInstance(): StatusMessageBroker {
    if (!StatusMessageBroker.instance) {
      StatusMessageBroker.instance = new StatusMessageBroker()
    }
    return StatusMessageBroker.instance
  }

  public registerClient(uploadId: string, client: Transform) {
    const clients = this.clients[uploadId]
    if (clients) {
      clients.push(client)
      client.on("close", () => {})
    } else {
      this.clients[uploadId] = [client]
    }
  }

  public unregisterClient(uploadId: string, client: Transform) {
    const clients = this.clients[uploadId]
    if (clients) {
      const index = clients.indexOf(client)
      if (index > -1) clients.splice(index, 1)
      else log.info(`Client not found in clients list`)
      // delete the record entry if there are no more clients
      if (!clients.length) delete this.clients[uploadId]
    } else {
      log.info(`No clients registered for upload ${uploadId}`)
    }
  }

  public broadcast(uploadId: string, message: StatusMessage) {
    const clients = this.clients[uploadId]
    if (clients) {
      clients.forEach((client) => writeEvent(client, message))
    } else {
      log.debug(`No clients registered for upload ${uploadId}`)
    }
  }
}

export const statusMessageBroker = StatusMessageBroker.getInstance()
