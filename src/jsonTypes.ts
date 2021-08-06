import { z } from "zod";
export const newVideoMessageSchema = z.object({
  version: z.literal(1),
  video_id: z.number(),
  orig_filename: z.string(),
  s3_key: z.string(),
});

export type newVideoMessage = z.infer<typeof newVideoMessageSchema>;
