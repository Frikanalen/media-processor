export type Provider = "S3" | "CLOUDFLARE"
export type LocatorString = `${Provider}:${string}`
export type S3LocatorString = `${string}:${string}`
export const getLocator = (
  provider: Provider,
  bucket: string,
  key: string,
  name: string
): LocatorString => {
  return `${provider}:${bucket}:${key}/${name}`
}
