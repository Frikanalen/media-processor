import { Namespace } from "../../redis/classes/Namespace.js"
import type { ResumableUploadData } from "../types/ResumableUploadData.js"

export const resumableUploadNamespace = new Namespace<ResumableUploadData>(
  "resumable-uploads"
)
