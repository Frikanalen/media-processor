import { RedisNamespace } from "../redis/RedisNamespace"
import type { ResumableUploadData } from "./ResumableUploadData"

export const resumableUploadNamespace = new RedisNamespace<ResumableUploadData>(
  "resumable-uploads"
)
