type ThumbnailType = "large" | "medium" | "small"

export type ThumbnailSettings = {
  width: number
  height: number
}

export const ThumbnailDescriptors: Record<ThumbnailType, ThumbnailSettings> = {
  large: { width: 1280, height: 720 },
  medium: { width: 852, height: 480 },
  small: { width: 360, height: 640 },
}
