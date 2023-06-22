/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VideoMediaAssetForm } from "../models/VideoMediaAssetForm.js"
import type { VideoMediaForm } from "../models/VideoMediaForm.js"

import type { CancelablePromise } from "../core/CancelablePromise.js"
import { OpenAPI } from "../core/OpenAPI.js"
import { request as __request } from "../core/request.js"

export class MediaService {
  /**
   * (Used by media-processor) Register an uploaded file in the database
   * @param xApiKey
   * @param requestBody
   * @returns any Video media was created
   * @throws ApiError
   */
  public static postVideosMedia(
    xApiKey: string,
    requestBody: VideoMediaForm
  ): CancelablePromise<{
    id: number
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/videos/media",
      headers: {
        "X-Api-Key": xApiKey,
      },
      body: requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * (Used by media-processor) Register a new video media asset
   * @param id
   * @param xApiKey
   * @param requestBody
   * @returns any Video media asset was created
   * @throws ApiError
   */
  public static postVideosMediaAssets(
    id: number,
    xApiKey: string,
    requestBody: VideoMediaAssetForm
  ): CancelablePromise<{
    id: number
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/videos/media/{id}/assets",
      path: {
        id: id,
      },
      headers: {
        "X-Api-Key": xApiKey,
      },
      body: requestBody,
      mediaType: "application/json",
    })
  }
}
