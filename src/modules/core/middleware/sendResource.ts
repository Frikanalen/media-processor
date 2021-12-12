import { Middleware } from "koa"

export const sendResource =
  (serialize: (data: any) => any): Middleware =>
  (context, next) => {
    const { resource } = context.state

    if (!resource) {
      throw new Error("Resource missing from context state!")
    }

    context.body = serialize(resource)
    return next()
  }
