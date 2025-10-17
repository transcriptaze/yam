import * as generators from '../generators.js'

// Transmogrifies the track into an object with all valid fields:
// - 'missing' values are replaced by the equivalent default values
// - numbers sections sequentially
// - calculates section start measures
// - calculates subsection start measures
// - per section { time signature, pulse, tempo } information is moved to a list of subsections
export function realize(track) {
  const sections = transmogrify(track)

  return {
    UUID: track.UUID,
    timeSignature: track.timeSignature,
    pulse: track.pulse,
    tempo: track.tempo,
    BPM: track.BPM,
    ding: track.ding,
    dings: dings(track, sections),
    sections: sections,
  }
}

function transmogrify(track) {
  return [...generators.transmogrify(track)].map((v) => {
    return {
      ID: v.ID,
      start: v.start,
      measures: v.measures,
      role: v.role,
      dings: v.dings,
      subsections: v.subsections,
    }
  })
}

function dings(track, sections) {
  let offset = 0

  for (const section of sections) {
    if (section.role === 'count-in') {
      offset += section.measures
    } else if (section.role === 'anacrusis') {
      offset += section.measures
    } else {
      break
    }
  }

  let dings = track.dings?.map((v) => v + offset) ?? []

  dings.push(...sections.flatMap((v) => v.dings?.map((x) => x + v.start - 1) ?? []))

  sections.forEach((v) => {
    v.subsections?.forEach((ss) => {
      const list = ss.dings?.map((x) => x + ss.start - 1) ?? []

      dings.push(...list)
    })
  })

  return [...new Set(dings)].sort((p, q) => p - q)
}
