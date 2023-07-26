import * as Yup from "yup"

const StorageSchema = Yup.object().shape({
  Type: Yup.string().required(),
  Path: Yup.string(),
  Bucket: Yup.string(),
  Key: Yup.string(),
})

const HeaderSchema = Yup.lazy((value: any) =>
  Yup.object(
    Object.keys(value).reduce(
      (schema: Record<string, any>, key) => {
        schema[key] = Yup.array().of(Yup.string()).required()
        return schema
      },
      {} as Record<string, any>,
    ),
  ),
)

const MetaDataSchema = Yup.lazy((value: any) =>
  Yup.object(
    Object.keys(value).reduce(
      (schema: Record<string, any>, key) => {
        schema[key] = Yup.string().required()
        return schema
      },
      {} as Record<string, any>,
    ),
  ),
)

const UploadSchema = Yup.object().shape({
  ID: Yup.string().required(),
  Size: Yup.number().required(),
  Offset: Yup.number().required(),
  IsFinal: Yup.boolean().required(),
  IsPartial: Yup.boolean().required(),
  PartialUploads: Yup.array().of(Yup.string()).nullable(),
  MetaData: MetaDataSchema,
  Storage: StorageSchema.required(),
})

const HTTPRequestSchema = Yup.object().shape({
  Method: Yup.string().required(),
  URI: Yup.string().required(),
  RemoteAddr: Yup.string().required(),
  Header: HeaderSchema,
})

export const UploadObjectSchema = Yup.object().shape({
  Upload: UploadSchema,
  HTTPRequest: HTTPRequestSchema,
})
