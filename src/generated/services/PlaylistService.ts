/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NewPlaylistForm } from "../models/NewPlaylistForm"
import type { Playlist } from "../models/Playlist"
import type { ResourceList } from "../models/ResourceList"

import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"

export class PlaylistService {
  /**
   * Create a new playlist for an organization
   * @param id
   * @param requestBody
   * @returns Playlist Playlist was created
   * @throws ApiError
   */
  public static postOrganizationsPlaylists(
    id: number,
    requestBody: NewPlaylistForm
  ): CancelablePromise<Playlist> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/organizations/{id}/playlists",
      path: {
        id: id,
      },
      body: requestBody,
      mediaType: "application/json",
    })
  }

  /**
   * Get a list of playlists
   * @param offset Number of rows to skip
   * @param limit Number of rows to return
   * @param organization An id of the organization to filter by
   * @returns any A list of playlists
   * @throws ApiError
   */
  public static getPlaylists(
    offset?: number,
    limit: number = 5,
    organization?: number
  ): CancelablePromise<
    ResourceList & {
      rows?: Array<Playlist>
    }
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/playlists",
      query: {
        offset: offset,
        limit: limit,
        organization: organization,
      },
    })
  }

  /**
   * Get a specific playlist by id
   * @param id
   * @returns Playlist An playlist
   * @throws ApiError
   */
  public static getPlaylists1(id: number): CancelablePromise<Playlist> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/playlists/{id}",
      path: {
        id: id,
      },
      errors: {
        404: `The requested resource was not found`,
      },
    })
  }
}
