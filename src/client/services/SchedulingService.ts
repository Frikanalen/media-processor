/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { JukeboxSchedule } from "../models/JukeboxSchedule"
import type { ScheduleEntry } from "../models/ScheduleEntry"
import type { Video } from "../models/Video"

import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"

export class SchedulingService {
  /**
   * Get a portion of the schedule
   * @param from Defaults to start of day.
   * @param to Defaults to end of day of "from"
   * @returns ScheduleEntry A schedule
   * @throws ApiError
   */
  public static getSchedule(
    from?: string,
    to?: string
  ): CancelablePromise<Array<ScheduleEntry>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/scheduling/entries",
      query: {
        from: from,
        to: to,
      },
    })
  }

  /**
   * Internally get the pool of jukeboxable videos
   * @returns Video A list of videos
   * @throws ApiError
   */
  public static getSchedulingJukeboxable(): CancelablePromise<Array<Video>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/scheduling/jukeboxable",
    })
  }

  /**
   * Internally create jukebox schedule
   * @param requestBody
   * @returns any Jukebox schedule was created
   * @throws ApiError
   */
  public static postSchedulingJukebox(
    requestBody: JukeboxSchedule
  ): CancelablePromise<{
    message?: string
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/scheduling/jukebox",
      body: requestBody,
      mediaType: "application/json",
    })
  }
}
