import { PrismaClient } from "@prisma/client";
import { Logger } from "tslog";
import { runEveryMessage } from "./eventReceiver";
import { IngestNewVideo } from "./ingest";

const log: Logger = new Logger();
const prisma = new PrismaClient();

log.info("Media processor running.");

runEveryMessage(IngestNewVideo)
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    log.info("Goodbye");
    await prisma.$disconnect();
  });
