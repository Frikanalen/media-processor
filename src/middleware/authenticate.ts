import type { Middleware } from "koa"
import axios from "axios"
import { FK_API, FK_API_KEY, SECRET_KEY_HEADER } from "../config.js"
import { log } from "../log.js"

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
  cookieGetter?: (ctx: any) => string
}

// TODO: Some caching might be in order here, so that we don't hammer the API
// with a user profile load every time we upload a chunk of data
export const authenticate =
  (options: Options): Middleware<AuthState> =>
  async (ctx, next) => {
    const { required, cookieGetter } = options
    const cookie = cookieGetter ? cookieGetter(ctx) : ctx.get("Cookie")

    const { data, status } = await axios.get<AuthData>("/auth/user", {
      baseURL: FK_API,
      xsrfCookieName: "fk-csrf",
      xsrfHeaderName: "X-CSRF-Token",
      headers: {
        Cookie: cookie,
        [SECRET_KEY_HEADER]: FK_API_KEY,
      },
    })

    if (status !== 200) return ctx.throw(500, "auth_server_error")

    if (!data.user) {
      log.info(data.user)
      if (required) return ctx.throw(401)
    } else {
      ctx.state.user = data.user
    }

    return next()
  }
