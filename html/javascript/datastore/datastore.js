import * as models from '../models/models.js'
import * as _playlist from './playlist.js'
import * as _track from './track.js'
import * as _tracks from './tracks.js'
import { DEFAULT, RANDOM } from '../constants.js'

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

  setTitle(v, title) {
    let playlist = null

    if (v != null && typeof v === 'string') {
      playlist = models.playlists.playlist(v)
    }

    if (v != null && typeof v === 'object' && v.constructor.name === 'Playlist') {
      playlist = v
    }

    if (playlist != null) {
      playlist.title = title
    }
  },

  addTracks(v, tracks) {
    let playlist = null

    if (v != null && typeof v === 'string') {
      playlist = models.playlists.playlist(v)
    }

    if (v != null && typeof v === 'object' && v.constructor.name === 'Playlist') {
      playlist = v
    }

    if (playlist != null) {
      playlist.add(...tracks)
    }

    // ... update 'All Tracks'
    const all = models.playlists.playlist(DEFAULT.UUID)

    if (all != null) {
      all.add(...tracks.filter((v) => v.UUID != RANDOM.UUID))
    }
  },

  deleteTrack(v, track) {
    let playlist = null

    if (v != null && typeof v === 'string') {
      playlist = models.playlists.playlist(v)
    }

    if (v != null && typeof v === 'object' && v.constructor.name === 'Playlist') {
      playlist = v
    }

    playlist?.remove(track)

    if (!models.playlists.has(track)) {
      models.tracks.remove(track)
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
