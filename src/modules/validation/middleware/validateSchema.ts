import { Middleware } from "koa"
import { AnySchema } from "yup"

export const validateSchema =
  (schema: AnySchema): Middleware =>
  async (context, next) => {
    const data = await schema.validate(context.request.body)
    context.state.validated = data

    return next()
  }
