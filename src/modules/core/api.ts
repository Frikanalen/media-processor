import axios from "axios"
import { API_BASE_URL, SECRET_KEY, SECRET_KEY_HEADER } from "./constants"

export const api = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: "fk:csrf",
  xsrfHeaderName: "X-CSRF-Token",
  headers: {
    [SECRET_KEY_HEADER]: SECRET_KEY!,
  },
})
