import { z } from "zod";
import { Kafka, KafkaMessage } from "kafkajs";
import { hostname } from "os";
import { Ingest } from "./ingest";
import { Logger } from "tslog";
const log: Logger = new Logger();

export const newVideoMessageSchema = z.object({
  version: z.literal(1),
  video_id: z.number(),
  orig_filename: z.string(),
  s3_key: z.string(),
});

export type newVideoMessage = z.infer<typeof newVideoMessageSchema>;

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

export const runEveryMessage = async (
  callback: (message: KafkaMessage) => Promise<void>
) => {
  await consumer.connect();
  await consumer.subscribe({
    topic: "new-video-uploaded",
    fromBeginning: true,
  });

  await consumer.run({
    autoCommit: false,
    eachMessage: (payload) => callback(payload.message),
  });
};
