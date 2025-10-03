import * as models from '../models/models.js'
import * as generators from '../generators.js'

// Disambiguates the 'track' arg and returns a 'realized' object that is the track
// with all fields filled in.
//
// Returns 'null' if it is not a realizable track.
export function get(v) {
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
}

// Transmogrifies the track into an object with all valid fields:
// - 'missing' values are replaced by the equivalent default values
// - numbers sections sequentially
// - calculates section start measures
// - calculates subsection start measures
// - per section { time signature, pulse, tempo } information is moved to a list of subsections
function realize(track) {
  return {
    UUID: track.UUID,
    timeSignature: track.timeSignature,
    pulse: track.pulse,
    tempo: track.tempo,
    BPM: track.BPM,
    sections: transmogrify(track),
  }
}

function transmogrify(track) {
  return [...generators.transmogrify(track)].map((v) => {
    return {
      ID: v.ID,
      start: v.start,
      measures: v.measures,
      subsections: v.subsections,
    }
  })
}
