import * as generators from '../generators.js'

// Transmogrifies the track into an object with all valid fields:
// - 'missing' values are replaced by the equivalent default values
// - calculates track bars, count-in measures and pickup measures
// - numbers sections sequentially
// - calculates section start measures
// - calculates subsection start measures
// - per section { time signature, pulse, tempo } information is moved to a list of subsections
export function realize(track) {
  const sections = transmogrify(track)

  const bars = () => {
    return sections.reduce((measures, section) => measures + section.measures, 0)
  }

  const countIn = () => {
    if (sections.length > 0 && sections[0].role == 'count-in') {
      return sections[0].measures
    }

    return 0
  }

  const pickup = () => {
    if (sections.length > 0 && sections[0].role == 'count-in') {
      if (sections.length > 1 && sections[1].role == 'anacrusis') {
        return sections[1].measures
      }
    }

    if (sections.length > 0 && sections[0].role == 'anacrusis') {
      return sections[0].measures
    }

    return 0
  }

  return {
    UUID: track.UUID,

    title: track.title,
    timeSignature: track.timeSignature,
    pulse: track.pulse,
    tempo: track.tempo,
    BPM: track.BPM,

    bars: bars(),
    countIn: countIn(),
    pickup: pickup(),
    sections: sections,

    ding: track.ding,
    dings: dings(track, sections),
  }
}

function transmogrify(track) {
  return [...generators.transmogrify(track)].map((v) => {
    return {
      ID: v.ID,
      name: v.name,
      start: v.start,
      measures: v.measures,
      role: v.role,
      colour: v.colour,
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
