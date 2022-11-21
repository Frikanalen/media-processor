import type { LocatorString, Provider } from "../types.js"

export const getLocator = (
  provider: Provider,
  bucket: string,
  key: string,
  name: string
): LocatorString => {
  return `${provider}:${bucket}:${key}/${name}`
}
