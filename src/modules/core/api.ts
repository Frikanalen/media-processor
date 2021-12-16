import axios from "axios"
import { API_BASE_URL } from "./constants"

export const api = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: "fk:csrf",
  xsrfHeaderName: "X-CSRF-Token",
})
