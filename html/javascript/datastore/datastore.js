import * as models from '../models/models.js'
import * as _playlist from './playlist.js'
import * as _track from './track.js'
import * as _tracks from './tracks.js'

export const playlists = {
  // Disambiguates the 'playlist' arg and returns a 'realized' object that is the playlist
  // with all fields filled in.
  //
  // Returns 'null' if it is not a realizable playlist.
  get(v) {
    // .. resolve 'playlist' arg to an actual playlist
    let playlist = null

    if (v != null && typeof v === 'string') {
      playlist = models.playlists.playlist(v)
    }

    if (v != null && typeof v === 'object' && v.constructor.name === 'Playlist') {
      playlist = v
    }

    if (playlist == null) {
      return null
    }

    return _playlist.realize(playlist)
  },

  add_tracks(v, tracks) {
    let playlist = null

    if (v != null && typeof v === 'string') {
      playlist = models.playlists.playlist(v)
    }

    if (v != null && typeof v === 'object' && v.constructor.name === 'Playlist') {
      playlist = v
    }

    // FIXME - unify add_track and add_tracks
    if (playlist != null) {
      playlist.addx(tracks)
    }
  },
}

export const tracks = {
  // Returns a summary list of all tracks.
  list() {
    return _tracks.summarize()
  },

  // Disambiguates the 'track' arg and returns a 'realized' object that is the track
  // with all fields filled in.
  //
  // Returns 'null' if it is not a realizable track.
  get(v) {
    // .. resolve 'track' arg to an actual track
    let track = null

    if (v != null && typeof v === 'string') {
      track = models.tracks.track(v)
    }

    if (v != null && typeof v === 'object' && v.constructor.name === 'Track') {
      track = v
    }

    if (track == null) {
      return null
    }

    return _track.realize(track)
  },
}
