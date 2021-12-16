import { Locator, Provider } from "../types"

export const getLocator = (
  provider: Provider,
  bucket: string,
  key: string,
  name: string
): Locator => {
  return `${provider}:${bucket}:${key}/${name}`
}
