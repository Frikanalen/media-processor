type ThumbnailType = "thumbnail-large" | "thumbnail-medium" | "thumbnail-small"

export type ThumbnailSettings = {
  width: number
  height: number
}

export const ThumbnailDescriptors: Record<ThumbnailType, ThumbnailSettings> = {
  "thumbnail-large": { width: 1280, height: 720 },
  "thumbnail-medium": { width: 852, height: 480 },
  "thumbnail-small": { width: 360, height: 640 },
}
