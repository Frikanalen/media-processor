import type { Locator, Provider } from "../types.js"

export const getLocator = (
  provider: Provider,
  bucket: string,
  key: string,
  name: string
): Locator => {
  return `${provider}:${bucket}:${key}/${name}`
}
