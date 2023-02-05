/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Config } from "../models/Config"

import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"

export class AppService {
  /**
   * Get OpenAPI specification
   * @returns any The specification, in JSON format.
   * @throws ApiError
   */
  public static getOpenApiSpecJson(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/open-api-spec.json",
    })
  }

  /**
   * Get core data and config
   * This endpoint returns such things as server hostnames, categories, and other mostly static data.
   * @returns Config The config result
   * @throws ApiError
   */
  public static getConfig(): CancelablePromise<Config> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/config",
    })
  }
}
