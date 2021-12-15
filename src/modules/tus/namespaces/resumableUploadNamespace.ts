import { Namespace } from "../../redis/classes/Namespace"
import { ResumableUploadData } from "../types/ResumableUploadData"

export const resumableUploadNamespace = new Namespace<ResumableUploadData>(
  "resumable-uploads"
)
