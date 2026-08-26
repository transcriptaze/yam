import { OPCODES } from './constants.js'

export function compile(track) {
  const script = {
    delay: 0,
    script: [],
  }

  const sections = track?.sections ?? []

  // ... delay
  if (sections.length > 0) {
    script.delay = sections[0].delay ?? 0
  }

  // ... stop
  if (sections.length > 0) {
    const bars = sections.reduce((N, section) => {
      const measures = section.measures ?? Number.POSITIVE_INFINITY

      return N + measures
    }, 0)

    if (bars !== Number.POSITIVE_INFINITY) {
      script.script.push({ at: { measure: bars + 1, beat: 1 }, op: OPCODES.STOP })
    }
  }

  // ... dings
  dings(track).forEach((v) => {
    script.script.push({ at: { measure: v.measure, beat: v.beat }, op: OPCODES.DING })
  })

  // ... default
  script.script.push({ at: { measure: '*', beat: 1 }, op: OPCODES.TICK })
  script.script.push({ at: { measure: '*', beat: '*' }, op: OPCODES.TOCK })

  return script
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
