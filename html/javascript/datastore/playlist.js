import * as models from '../models/models.js'

export function realize(playlist) {
  const tracks = []
  const muted = playlist.muted

  playlist.tracks.forEach((v) => {
    if (playlist.internal(v)) {
      const title = () => {
        return `« ${playlist.internal(v)?.title ?? 'random'} »` // eslint-disable-line no-irregular-whitespace
      }

      tracks.push({
        UUID: v,
        title: title(),
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
          new: track.new,
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
