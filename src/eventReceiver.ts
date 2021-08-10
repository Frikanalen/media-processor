import { z } from "zod";
import { Kafka } from "kafkajs";
import { hostname } from "os";
import { Logger } from "tslog";

const log: Logger = new Logger();

export const newVideoMessageSchema = z.object({
  version: z.literal(1),
  video_id: z.number(),
  orig_filename: z.string(),
  s3_key: z.string(),
});

export type newVideoMessage = z.infer<typeof newVideoMessageSchema>;

export const runEveryMessage = async (
  callback: (message: newVideoMessage) => Promise<void>
) => {
  const kafka = new Kafka({
    clientId: hostname(),
    brokers: ["kafka-service.kafka.svc.cluster.local:9092"],
  });

  const consumer = kafka.consumer({ groupId: "media-processor" });

  log.info("Connecting to kafka...");
  await consumer.connect();
  log.info("Connected. Subscribing...");
  await consumer.subscribe({
    topic: "new-video-uploaded",
    fromBeginning: true,
  });
  log.info("Subscribed. Waiting for events...");
  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ message }) => {
      log.info("Message received.");
      if (!message.value) {
        log.warn("no message value", { message });
        return;
      }

      try {
        const newVideo = newVideoMessageSchema.parse(
          JSON.parse(message.value.toString())
        );
        log.info("received new video", newVideo);
        return callback(newVideo);
      } catch (e) {
        log.warn(e);
      }
    },
  });
};
