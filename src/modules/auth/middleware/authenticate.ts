import { Middleware } from "koa"
import { api } from "../../core/api"
import { HttpError } from "../../core/classes/HttpError"

export type AuthUser = {
  id: number
}

export type AuthData = {
  user: AuthUser
}

export type AuthState = {
  user: AuthUser
}

export type Options = {
  required?: true
}

export const authenticate =
  (options: Options): Middleware<AuthState> =>
  async (context, next) => {
    const { required } = options
    const cookie = context.get("Cookie")

    const { data } = await api.get<AuthData>("/auth/user", {
      headers: {
        Cookie: cookie,
      },
    })

    const { user } = data

    if (!user && required) {
      throw new HttpError(401)
    }

    if (user) {
      context.state.user = user
    }

    return next()
  }
