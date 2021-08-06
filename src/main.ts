import { PrismaClient } from "@prisma/client";
const { Kafka } = require("kafkajs");
import { hostname } from "os";
import { KafkaMessage } from "kafkajs";

import { Logger } from "tslog";

import { newVideoMessageSchema } from "./jsonTypes";
import { Ingest } from "./ingest";

const log: Logger = new Logger();

const prisma = new PrismaClient();
const kafka = new Kafka({
  clientId: hostname(),
  brokers: ["192.168.40.2:9092"],
});

const consumer = kafka.consumer({ groupId: "media-processor" });

type eachMessageHandler = {
  topic: string;
  partition: number;
  message: KafkaMessage;
};

async function main() {
  await consumer.connect();
  await consumer.subscribe({
    topic: "new-video-uploaded",
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message }: eachMessageHandler) => {
      if (!message.value) {
        log.warn("no message value", { message });
        return;
      }

      try {
        const newVideo = newVideoMessageSchema.parse(
          JSON.parse(message.value.toString())
        );
        log.info("received new video", newVideo);
        await Ingest(newVideo);
      } catch (e) {
        log.warn(e);
      }
    },
  });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    log.info("Goodbye");
    await prisma.$disconnect();
  });
