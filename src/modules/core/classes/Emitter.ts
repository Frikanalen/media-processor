export type Handler<T> = (data: T) => void

export type Listener<E> = {
  name: E
  handler: (data: any) => void
}

export class Emitter<E extends object> {
  private listeners: Listener<keyof E>[] = []

  public on<K extends keyof E>(name: K, handler: Handler<E[K]>) {
    this.listeners.push({ name, handler })
  }

  public off<K extends keyof E>(name: K, handler: Handler<E[K]>) {
    this.listeners = this.listeners.filter(
      (l) => !(l.name === name && l.handler === handler)
    )
  }

  public emit<K extends keyof E>(name: K, data: E[K]) {
    const listeners = this.listeners.filter((l) => l.name === name)

    for (const listener of listeners) {
      listener.handler(data)
    }
  }

  public removeAll() {
    this.listeners = []
  }
}
