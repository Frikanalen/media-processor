import fs from "fs";
import { Readable } from "stream";
import { S3 } from "@aws-sdk/client-s3";
process.env["AWS_SECRET_ACCESS_KEY"] =
  "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
process.env["AWS_ACCESS_KEY_ID"] = "AKIAIOSFODNN7EXAMPLE";

const s3 = new S3({
  forcePathStyle: true,
  endpoint: "http://s3.fk.dev.local/",
  region: "no-where-1",
});
export const getS3 = async (
  bucket: string,
  key: string,
  targetFile: string
): Promise<void> => {
  const s3object = await s3.getObject({ Bucket: bucket, Key: key });
  const localFile = fs.createWriteStream(targetFile);

  if (!(s3object.Body instanceof Readable))
    throw new Error(`expected body type Readable, got ${typeof s3object.Body}`);

  await s3object.Body.pipe(localFile);
};
export const putS3 = async (
  bucket: string,
  key: string,
  sourceFile: string,
  contentType: string
): Promise<void> => {
  await s3.putObject({
    Body: fs.createReadStream(sourceFile),
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
};
export const deleteS3 = async (bucket: string, key: string): Promise<void> => {
  await s3.deleteObject({
    Bucket: bucket,
    Key: key,
  });
};
