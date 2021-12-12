import { InferType, number, object, string } from "yup";

/**
 *@openapi
 *components:
 *  schemas:
 *    IncomingFile:
 *      type: object
 *      properties:
 *        fileName:
 *          type: string
 *        objectKey:
 *          type: string
 *      required:
 *        - fileName
 *        - objectKey
 */
export const ingestSchema = object({
  fileName: string().required(),
  objectKey: string().required(),
});
