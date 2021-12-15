export const parseMetadata = (metadata: string): Record<string, string> => {
  const result: any = {}
  const rows = metadata.split(",")

  for (const row of rows) {
    const pair = row.split(" ")

    const key = pair[0]
    const value = Buffer.from(pair[1], "base64").toString("ascii")

    result[key] = value
  }

  return result
}
