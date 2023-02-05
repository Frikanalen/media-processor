/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Video } from "./Video"

export type ScheduleEntry = {
  type: string
  startsAt: string
  endsAt: string
  video: Video
}
