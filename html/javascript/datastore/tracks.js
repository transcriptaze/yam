import * as models from '../models/models.js'

export function summarize() {
  const tracks = models.tracks.tracks ?? []

  return tracks.map((v) => {
    return {
      UUID: v.UUID,
      title: v.title,
    }
  })
}
