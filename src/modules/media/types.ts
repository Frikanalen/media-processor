export type Provider = "S3" | "CLOUDFLARE"

export type LocatorString = `${Provider}:${string}`
export type S3LocatorString = `${string}:${string}`
