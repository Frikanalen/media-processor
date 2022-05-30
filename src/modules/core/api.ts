import axios from "axios"
import { API_BASE_URL, FK_API_KEY, SECRET_KEY_HEADER } from "./constants"
import { OpenAPI } from "../../client"

OpenAPI.BASE = API_BASE_URL!

OpenAPI.HEADERS = async (r) => {
  return {
    [SECRET_KEY_HEADER]: FK_API_KEY!,
    "X-CSRF-Token": r?.cookies?.["fk:csrf"] ?? "",
  }
}

export const FKAPI = OpenAPI

export const api = axios.create({
  baseURL: API_BASE_URL,
  xsrfCookieName: "fk:csrf",
  xsrfHeaderName: "X-CSRF-Token",
  headers: {
    [SECRET_KEY_HEADER]: FK_API_KEY!,
  },
})
