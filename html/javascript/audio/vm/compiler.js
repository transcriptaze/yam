import { DEFAULT } from '../../constants.js'
import { parseTimeSignature } from '../../util.js'
import { OPCODES, SUBDIVISIONS } from './constants.js'

const PULSE = new Map([
  ['eighth', SUBDIVISIONS.EIGHTH_NOTES],
  ['eighth-doublet', SUBDIVISIONS.EIGHTH_DOUBLETS],
  ['eighth-triplet', SUBDIVISIONS.EIGHTH_TRIPLETS],
  ['quarter', SUBDIVISIONS.QUARTER_NOTES],
  ['dotted-quarter', SUBDIVISIONS.DOTTED_QUARTERS],
  ['half', SUBDIVISIONS.HALF_NOTES],
  ['dotted-half', SUBDIVISIONS.DOTTED_HALF_NOTES],
])

export function compile(v) {
  const track = transmogrify(v)

  // ... no track?
  if (track == null) {
    return {
      UUID: DEFAULT.UUID,
      delay: 0,
      loops: Number.POSITIVE_INFINITY,
      script: [
        { at: { measure: '*', beat: 1 }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }
  }

  // ... compile track
  const script = {
    UUID: UUID(track),
    tempo: track.tempo,
    delay: delay(track),
    loops: loops(track),
    script: [],
  }

  // ... delay
  script.delay = delay(track)

  // ... stop
  stop(track).forEach((v) => {
    script.script.push({ at: { measure: v.measure, beat: v.beat }, op: OPCODES.STOP })
  })

  // ... dings
  dings(track).forEach((v) => {
    script.script.push({ at: { measure: v.measure, beat: v.beat }, op: OPCODES.DONG })
  })

  // ... count-in
  countIn(track).forEach((v) => {
    script.script.push({ at: { measure: v.measure, beat: v.beat }, op: v.op })
  })

  // ... anacrusis
  anacruses(track).forEach((v) => {
    script.script.push({ at: { measure: v.measure, beat: v.beat }, op: v.op })
  })

  // ... tempo
  tempo(track).forEach(({ measure, beat, tempo }) => {
    script.script.push({ at: { measure, beat }, op: OPCODES.TEMPO, tempo: tempo })
  })

  // ... time signature
  timeSignature(track).forEach(({ measure, beat, timeSignature }) => {
    script.script.push({ at: { measure, beat }, op: OPCODES.TIME_SIGNATURE, timeSignature: timeSignature })
  })

  // ... subdivisions
  subdivisions(track).forEach(({ measure, beat, subdivisions }) => {
    script.script.push({ at: { measure, beat }, op: OPCODES.SUBDIVISIONS, subdivisions: subdivisions })
  })

  // ... clicks
  clicks(track).forEach(({ measure, beat, click }) => {
    script.script.push({ at: { measure, beat }, op: click })
  })

  // ... default

  script.script.push({ at: { measure: '*', beat: 1 }, op: OPCODES.TICK })

  if (track.timeSignature === '6:8' && track.pulse === 'dotted-quarter') {
    script.script.push({ at: { measure: '*', beat: 1 }, op: OPCODES.TICK })
    script.script.push({ at: { measure: '*', beat: 4 }, op: OPCODES.TOCK })
    script.script.push({ at: { measure: '*', beat: '*' }, op: OPCODES.SKIP })
  } else {
    script.script.push({ at: { measure: '*', beat: '*' }, op: OPCODES.TOCK })
  }

  return script
}

function UUID(track) {
  return track?.UUID ?? DEFAULT.UUID
}

function delay(track) {
  const sections = track?.sections ?? []

  if (sections.length > 0) {
    return sections[0].delay ?? 0
  }

  return 0
}

function loops(track) {
  return track?.loops ?? Number.POSITIVE_INFINITY
}

function stop(track) {
  const list = []
  const sections = track?.sections ?? []

  if (sections.length > 0) {
    const bars = sections.reduce((N, section) => {
      let measures = section.measures ?? Number.POSITIVE_INFINITY

      if (section.role === 'count-in' && measures === Number.POSITIVE_INFINITY) {
        measures = 1
      }

      if (section.role === 'anacrusis' && measures === Number.POSITIVE_INFINITY) {
        measures = 1
      }

      return N + measures
    }, 0)

    if (bars !== Number.POSITIVE_INFINITY) {
      list.push({ measure: bars + 1, beat: 1 })
    }
  }

  return list
}

function dings(track) {
  const parse = (v) => {
    {
      const re = /([1-9][0-9]*):((?:[1-9][0-9]*)(?:[.][0-9]+)?)/
      const match = `${v}`.match(re)

      if (match && match.length == 3) {
        return {
          measure: parseInt(match[1]),
          beat: parseFloat(match[2]),
        }
      }
    }

    {
      // ... legacy
      const re = /([1-9][0-9]*)[.]([0-9]+)/
      const match = `${v}`.match(re)

      if (match && match.length == 3) {
        return {
          measure: parseInt(match[1]),
          beat: parseInt(match[2]),
        }
      }
    }

    return null
  }

  const sections = track?.sections ?? []
  const dings = []

  if (track.dings) {
    track.dings.forEach((v) => {
      const ding = parse(v)

      if (ding != null) {
        dings.push({ measure: ding.measure, beat: ding.beat })
      }
    })
  }

  if (sections.length > 0) {
    let start = 0
    sections.forEach((section) => {
      const measures = section.measures ?? Number.POSITIVE_INFINITY
      const end = start + measures

      if (section.dings) {
        section.dings.forEach((v) => {
          const ding = parse(v)

          if (ding != null) {
            const at = start + ding.measure

            if (start < at && at <= end) {
              dings.push({ measure: start + ding.measure, beat: ding.beat })
            }
          }
        })
      }

      start += measures
    })
  }

  const unique = []

  return dings
    .filter((v) => {
      if (unique.findIndex((u) => u.measure === v.measure && u.beat === v.beat) !== -1) {
        return false
      }

      unique.push(v)
      return true
    })
    .sort((p, q) => {
      if (p.measure !== q.measure) {
        return p.measure - q.measure
      } else {
        return p.beat - q.beat
      }
    })
}

function countIn(track) {
  const list = []
  const sections = track?.sections ?? []
  let measure = 1

  const f = (section) => {
    const timeSignature = section.timeSignature ?? track.timeSignature
    const pulse = section.pulse ?? track.pulse

    if (section.clicks != null) {
      return section.clicks
    }

    if (timeSignature === '3:8' && pulse === 'dotted-quarter') {
      return [1]
    }

    if (timeSignature === '6:8' && pulse === 'dotted-quarter') {
      return [1, 4]
    }

    return []
  }

  for (const section of sections) {
    // NTS: expects count-in at start of track only
    if (section.role !== 'count-in') {
      break
    }

    const measures = section.measures ?? 1
    const clicks = f(section)

    for (let m = 0; m < measures; m++) {
      clicks.forEach((click) => {
        if (!isNaN(click)) {
          list.push({ measure: measure + m, beat: click, op: OPCODES.STICKS })
        }
      })
    }

    for (let m = 0; m < measures; m++) {
      if (clicks.length > 0) {
        list.push({ measure: measure + m, beat: '*', op: OPCODES.SKIP })
      } else {
        list.push({ measure: measure + m, beat: '*', op: OPCODES.STICKS })
      }
    }

    measure++
  }

  return list
}

function anacruses(track) {
  const { beats, _divisions } = parseTimeSignature(track.timeSignature)
  const sections = track?.sections ?? []
  const list = []

  const f = (section) => {
    const timeSignature = section.timeSignature ?? track.timeSignature
    const pulse = section.pulse ?? track.pulse

    if (section.clicks != null) {
      return section.clicks
    }

    if (timeSignature === '3:8' && pulse === 'dotted-quarter') {
      return {
        1: OPCODES.STICKS,
      }
    }

    if (timeSignature === '6:8' && pulse === 'dotted-quarter') {
      return {
        1: OPCODES.STICKS,
        4: OPCODES.STICKS,
      }
    }

    return null
  }

  // NTS: do NOT use Number.isNaN (expects actual numbers)
  let bar = 1
  for (const section of sections) {
    if (section.role === 'anacrusis') {
      const measures = section.measures ?? 1
      const clicks = f(section)

      // default: click on last beat
      if (clicks == null) {
        if (!isNaN(beats)) {
          list.push({ measure: bar + measures - 1, beat: beats, op: OPCODES.TOCK })
        }

        for (let m = 0; m < measures; m++) {
          list.push({ measure: bar + m, beat: '*', op: OPCODES.STICKS })
        }
      } else if (!Array.isArray(clicks)) {
        for (const [k, v] of Object.entries(clicks)) {
          const beat = parseFloat(`${k}`)
          if (!isNaN(beat)) {
            list.push({ measure: bar + measures - 1, beat, op: `${v}` })
          }
        }

        list.push({ measure: bar + measures - 1, beat: '*', op: OPCODES.SKIP })
      } else {
        clicks.forEach((click) => {
          if (!isNaN(click)) {
            list.push({ measure: bar + measures - 1, beat: click, op: OPCODES.TOCK })
          }
        })

        for (let m = 0; m < measures; m++) {
          list.push({ measure: bar + m, beat: '*', op: OPCODES.STICKS })
        }
      }
    }

    bar += section.measures ?? Number.POSITIVE_INFINITY
    if (bar === Number.POSITIVE_INFINITY) {
      break
    }
  }

  return list
}

function tempo(track) {
  const sections = track?.sections ?? []
  const list = []

  let bar = 1
  for (const section of sections) {
    const tempo = section.tempo

    if (tempo && !Number.isNaN(tempo)) {
      list.push({ measure: bar, beat: 1, tempo: tempo })
    }

    bar += section.measures ?? Number.POSITIVE_INFINITY
    if (bar === Number.POSITIVE_INFINITY) {
      break
    }
  }

  return list
}

function timeSignature(track) {
  const sections = track?.sections ?? []
  const list = []

  let bar = 1
  for (const section of sections) {
    const timeSignature = section.timeSignature

    if (timeSignature) {
      const { beats, divisions } = parseTimeSignature(timeSignature)

      if (!isNaN(beats) && !isNaN(divisions)) {
        list.push({ measure: bar, beat: 1, timeSignature: { beats, divisions } })
      }
    }

    bar += section.measures ?? Number.POSITIVE_INFINITY
    if (bar === Number.POSITIVE_INFINITY) {
      break
    }
  }

  return list
}

function subdivisions(track) {
  const sections = track?.sections ?? []
  const list = []

  let bar = 1
  for (const section of sections) {
    const pulse = section.pulse

    if (pulse) {
      if (PULSE.has(pulse)) {
        list.push({ measure: bar, beat: 1, subdivisions: PULSE.get(pulse) })
      }
    }

    bar += section.measures ?? Number.POSITIVE_INFINITY
    if (bar === Number.POSITIVE_INFINITY) {
      break
    }
  }

  return list
}

function clicks(track) {
  const list = []

  // ... track clicks
  const clicks = track.clicks

  if (clicks != null && Array.isArray(clicks)) {
    for (const beat of clicks) {
      if (beat === 1) {
        list.push({ measure: '*', beat, click: OPCODES.TICK })
      } else {
        list.push({ measure: '*', beat, click: OPCODES.TOCK })
      }
    }

    list.push({ measure: '*', beat: '*', click: OPCODES.SKIP })
  } else if (clicks != null && typeof clicks === 'object') {
    for (const [k, v] of Object.entries(clicks)) {
      const beat = parseFloat(`${k}`)
      if (!isNaN(beat)) {
        list.push({ measure: '*', beat, click: `${v}` })
      }
    }

    list.push({ measure: '*', beat: '*', click: OPCODES.SKIP })
  }

  // ... section clicks
  const sections = track?.sections ?? []

  let measure = 1
  for (const section of sections) {
    if (['count-in', 'anacrusis'].includes(section.role)) {
      continue
    }

    const clicks = section.clicks
    const measures = section.measures ?? Number.POSITIVE_INFINITY

    if (clicks != null && Array.isArray(clicks)) {
      if (!isNaN(measures) && measures !== Number.POSITIVE_INFINITY) {
        for (let i = 0; i < measures; i++) {
          for (const beat of clicks) {
            if (beat === 1) {
              list.push({ measure: measure + i, beat, click: OPCODES.TICK })
            } else {
              list.push({ measure: measure + i, beat, click: OPCODES.TOCK })
            }
          }

          list.push({ measure: measure + i, beat: '*', click: OPCODES.SKIP })
        }
      }

      if (!isNaN(measures) && measures === Number.POSITIVE_INFINITY) {
        for (const beat of clicks) {
          if (beat === 1) {
            list.push({ measure: '*', beat, click: OPCODES.TICK })
          } else {
            list.push({ measure: '*', beat, click: OPCODES.TOCK })
          }
        }

        list.push({ measure: '*', beat: '*', click: OPCODES.SKIP })
      }
    } else if (clicks != null && typeof clicks === 'object') {
      if (!isNaN(measures) && measures !== Number.POSITIVE_INFINITY) {
        for (let i = 0; i < measures; i++) {
          for (const [k, v] of Object.entries(clicks)) {
            const beat = parseFloat(`${k}`)
            if (!isNaN(beat)) {
              list.push({ measure: measure + i, beat, click: `${v}` })
            }
          }

          list.push({ measure: measure + i, beat: '*', click: OPCODES.SKIP })
        }
      }

      if (!isNaN(measures) && measures === Number.POSITIVE_INFINITY) {
        for (const [k, v] of Object.entries(clicks)) {
          const beat = parseFloat(`${k}`)
          if (!isNaN(beat)) {
            list.push({ measure: '*', beat, click: `${v}` })
          }
        }

        list.push({ measure: '*', beat: '*', click: OPCODES.SKIP })
      }
    }

    measure += measures
    if (measure === Number.POSITIVE_INFINITY) {
      break
    }
  }

  return list
}

function transmogrify(track) {
  if (track == null) {
    return null
  }

  const f = (section) => {
    return {
      role: section.role,
      measures: section.measures,
      timeSignature: section.timeSignature,
      tempo: section.tempo,
      pulse: section.pulse,
      clicks: section.clicks,
      dings: section.dings,
      delay: section.delay,
    }
  }

  function* unroll() {
    const sections = track?.sections ?? []

    for (const section of sections) {
      if (section.subsections != null) {
        for (const subsection of section.subsections) {
          yield {
            role: subsection.role ?? section.role,
            measures: subsection.measures,
            timeSignature: subsection.timeSignature,
            tempo: subsection.tempo,
            pulse: subsection.pulse,
            clicks: subsection.clicks,
            dings: subsection.dings,
            delay: subsection.delay,
          }
        }
      } else {
        yield section
      }
    }
  }

  return {
    UUID: track.UUID,
    tempo: track.tempo,
    delay: track.delay ?? 0,
    timeSignature: track.timeSignature,
    pulse: track.pulse,
    clicks: track.clicks,
    loops: track.loops,
    dings: track.dings,
    sections: [...unroll(track)].flatMap((v) => f(v)),
  }
}
