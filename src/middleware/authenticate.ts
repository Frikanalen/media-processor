import type { Middleware } from "koa"
import axios from "axios"
import { FK_API, FK_API_KEY, SECRET_KEY_HEADER } from "../constants.js"

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

// TODO: Some caching might be in order here, so that we don't hammer the API
// with a user profile load every time we upload a chunk of data
export const authenticate =
  (options: Options): Middleware<AuthState> =>
  async (ctx, next) => {
    const { required } = options
    const cookie = ctx.get("Cookie")

    const { data, status } = await axios.get<AuthData>("/auth/user", {
      baseURL: FK_API,
      xsrfCookieName: "fk-csrf",
      xsrfHeaderName: "X-CSRF-Token",
      headers: {
        Cookie: cookie,
        [SECRET_KEY_HEADER]: FK_API_KEY,
      },
    })

    if (status !== 200) ctx.throw(500, "could not reach backend to auth user")

    if (!data.user) {
      if (required) ctx.throw(401)
    } else {
      ctx.state.user = data.user
    }

    return next()
  }
