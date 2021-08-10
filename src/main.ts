import { PrismaClient } from "@prisma/client";
import { Logger } from "tslog";

import { IngestNewVideo } from "./ingest";
import { newVideoMessageSchema, runEveryMessage } from "./eventReceiver";

const log: Logger = new Logger();
const prisma = new PrismaClient();

runEveryMessage(async (message) => {
  if (!message.value) {
    log.warn("no message value", { message });
    return;
  }

  try {
    const newVideo = newVideoMessageSchema.parse(
      JSON.parse(message.value.toString())
    );
    log.info("received new video", newVideo);
    await IngestNewVideo(newVideo);
  } catch (e) {
    log.warn(e);
  }
})
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    log.info("Goodbye");
    await prisma.$disconnect();
  });
