/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewVideoForm } from "../models/NewVideoForm"
import type { ResourceList } from "../models/ResourceList"
import type { Video } from "../models/Video"

import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"

export class VideoService {
  /**
   * Create a new video for an organization
   * @param orgId
   * @param requestBody
   * @returns Video Video was created
   * @throws ApiError
   */
  public static newVideo(
    orgId: number,
    requestBody: NewVideoForm
  ): CancelablePromise<Video> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/organizations/{orgId}/videos",
      path: {
        orgId: orgId,
      },
      body: requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * Get a list of videos
   * @param offset Number of rows to skip
   * @param limit Number of rows to return
   * @param inPlaylist An id of a playlist to filter by. Orders by playlist entry indices.
   * @param organization An id of an organization to filter by
   * @returns any A list of videos
   * @throws ApiError
   */
  public static getVideos(
    offset?: number,
    limit: number = 5,
    inPlaylist?: number,
    organization?: number
  ): CancelablePromise<
    ResourceList & {
      rows?: Array<Video>
    }
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/videos",
      query: {
        offset: offset,
        limit: limit,
        inPlaylist: inPlaylist,
        organization: organization,
      },
    })
  }

  /**
   * Get a specific video by id
   * @param id
   * @returns Video A video
   * @throws ApiError
   */
  public static getVideos1(id: number): CancelablePromise<Video> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/videos/{id}",
      path: {
        id: id,
      },
      errors: {
        404: `The requested resource was not found`,
      },
    })
  }
}
