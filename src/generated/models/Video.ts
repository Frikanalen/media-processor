/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Organization } from "./Organization"
import type { VideoMediaAsset } from "./VideoMediaAsset"

export type Video = {
  id: number
  title: string
  description: string
  duration: number
  categories: Array<number>
  createdAt: string
  updatedAt: string
  organization: Organization
  media: {
    id: number
    assets: Array<VideoMediaAsset>
  }
  viewCount: number
  jukeboxable: boolean
}