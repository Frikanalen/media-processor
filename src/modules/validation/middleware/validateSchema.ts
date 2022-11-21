import type { Middleware } from "koa"
import type { AnySchema } from "yup"

export const validateSchema =
  (schema: AnySchema): Middleware =>
  async (context, next) => {
    context.state["validated"] = await schema.validate(context.request.body)

    return next()
  }
