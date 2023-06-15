export const parseMetadata = (metadata: string): Record<string, string> => {
  const result: any = {}
  const rows = metadata.split(",")

  for (const row of rows) {
    const [key, rawValue] = row.split(" ") as [string, string]

    result[key] = Buffer.from(rawValue, "base64").toString("ascii")
  }

  return result
}
