import { api } from "../../core/api"

export type VideoMediaAssetData = {
  locator: string
  type: string
  metadata: object
  mediaId: number
}

export const createVideoMediaAsset = async (data: VideoMediaAssetData) => {
  const { mediaId, ...rest } = data
  await api.post(`/videos/media/${mediaId}/assets`, rest)
}
