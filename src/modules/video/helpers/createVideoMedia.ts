import { api } from "../../core/api"

export type VideoMediaData = {
  fileName: string
  locator: string
  duration: number
  metadata: object
}

export const createVideoMedia = async (data: VideoMediaData) => {
  const response = await api.post<{ id: number }>("/videos/media", data)
  return response.data
}
