import * as models from '../models/models.js'
import { realize } from './track.js'

export const tracks = {
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

    return realize(track)
  },
}
