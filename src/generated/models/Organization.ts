/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { User } from "./User.js"

export type Organization = {
  id?: number
  name?: string
  description?: string
  homepage?: string
  postalAddress?: string
  streetAddress?: string
  editor?: User
}
