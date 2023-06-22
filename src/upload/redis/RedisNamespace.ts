import { connection } from "./connection.js"

export class RedisNamespace<T extends object> {
  constructor(private prefix: string) {}

  public set(key: string, value: T, duration?: number) {
    return connection.set(this.getKey(key), JSON.stringify(value), {
      EX: duration!,
    })
  }

  public async get(key: string) {
    const value = await connection.get(this.getKey(key))

    if (value) {
      return JSON.parse(value) as T
    }

    return null
  }

  public delete(key: string) {
    return connection.del(this.getKey(key))
  }

  public async assign(key: string, value: Partial<T>) {
    const existing = await this.get(key)

    if (existing) {
      const newData = { ...existing, ...value }
      await this.set(key, newData)
    }
  }

  private getKey(key: string) {
    return `${this.prefix}:${key}`
  }
}
