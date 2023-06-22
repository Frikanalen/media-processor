/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Video } from "./Video.js"

export type ScheduleEntry = {
  type: string
  startsAt: string
  endsAt: string
  video: Video
}
