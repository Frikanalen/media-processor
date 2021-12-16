import { Locator, Provider } from "../types"

export const getLocator = (
  provider: Provider,
  key: string,
  name: string
): Locator => {
  return `${provider}:${key}/${name}`
}
