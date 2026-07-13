import { RANDOM } from '../constants.js'
import * as models from '../models/models.js'

export function realize(playlist) {
  const tracks = []
  const muted = playlist.muted

  playlist.tracks.forEach((v) => {
    if (playlist.internal(v)) {
      tracks.push({
        UUID: v.UUID,
        title: RANDOM.TITLE, // FIXME - check title first
        muted: v.muted,
        random: true,
      })
    } else {
      const track = models.tracks.track(v)

      if (track != null) {
        tracks.push({
          UUID: track.UUID,
          title: track.title,
          muted: muted.includes(track.UUID),
          random: false,
        })
      }
    }
  })

  return {
    UUID: playlist.UUID,

    title: playlist.title,
    tracks: tracks,
  }
}
