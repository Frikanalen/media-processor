import { redis } from "../redis"

export class Namespace<T extends object> {
  constructor(private prefix: string) {}

  public set(key: string, value: T, duration?: number) {
    return redis.set(this.getKey(key), JSON.stringify(value), {
      EX: duration,
    })
  }

  public async get(key: string) {
    const value = await redis.get(this.getKey(key))

    if (value) {
      return JSON.parse(value) as T
    }
  }

  public delete(key: string) {
    return redis.del(this.getKey(key))
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
