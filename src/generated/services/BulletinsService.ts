/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Bulletin } from "../models/Bulletin"
import type { NewBulletinForm } from "../models/NewBulletinForm"
import type { ResourceList } from "../models/ResourceList"

import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"

export class BulletinsService {
  /**
   * Get a list of bulletins
   * @returns any A list of bulletins
   * @throws ApiError
   */
  public static getBulletins(): CancelablePromise<
    ResourceList & {
      rows?: Array<Bulletin>
    }
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/bulletins",
    })
  }

  /**
   * Create a new bulletin
   * @param requestBody
   * @returns Bulletin Organization was created
   * @throws ApiError
   */
  public static postBulletins(
    requestBody: NewBulletinForm
  ): CancelablePromise<Bulletin> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/bulletins",
      body: requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * Get a specific news bulletin by id
   * @param id
   * @returns Bulletin Bulletin
   * @throws ApiError
   */
  public static getBulletins1(id: number): CancelablePromise<Bulletin> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/bulletins/{id}",
      path: {
        id: id,
      },
      errors: {
        404: `The requested resource was not found`,
      },
    })
  }

  /**
   * Update a bulletin
   * @param id
   * @returns Bulletin Bulletin
   * @throws ApiError
   */
  public static putBulletins(id: number): CancelablePromise<Bulletin> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/bulletins/{id}",
      path: {
        id: id,
      },
      errors: {
        403: `You don't have the required permissions to perform this action`,
        404: `The requested resource was not found`,
      },
    })
  }

  /**
   * Deletes a bulletin
   * @param id
   * @returns void
   * @throws ApiError
   */
  public static deleteBulletins(id: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/bulletins/{id}",
      path: {
        id: id,
      },
      errors: {
        403: `You don't have the required permissions to perform this action`,
        404: `The requested resource was not found`,
      },
    })
  }
}
