/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Category } from "./Category"

export type Config = {
  servers?: {
    media?: string
  }
  categories?: Array<Category>
}