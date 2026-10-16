import { OPCODES } from './constants.js'

export function link(script) {
  sort(script)
  prune(script)
  compact(script)
}

// sort ops into measure + beat order
function sort(script) {
  const compare = (p, q) => {
    if (Number.isNaN(p) && Number.isNaN(q)) {
      return 0
    }

    if (Number.isNaN(p) && !Number.isNaN(q)) {
      return 1
    }

    if (!Number.isNaN(p) && Number.isNaN(q)) {
      return -1
    }

    return p - q
  }

  script.script.sort((p, q) => {
    const measure = {
      p: parseInt(`${p.at.measure}`),
      q: parseInt(`${q.at.measure}`),
    }

    const beat = {
      p: parseFloat(`${p.at.beat}`),
      q: parseFloat(`${q.at.beat}`),
    }

    const u = compare(measure.p, measure.q)

    if (u !== 0) {
      return u
    }

    const v = compare(beat.p, beat.q)

    if (v !== 0) {
      return v
    }

    // ... operator precedence
    // FIXME this is really fragile - it depends on operator precendence to let skip, sticks, etc override e.g. tock
    const precedence = [
      OPCODES.TEMPO,
      OPCODES.TIME_SIGNATURE,
      OPCODES.SUBDIVISIONS,
      OPCODES.DELAY,
      OPCODES.STOP,
      OPCODES.SKIP,
      OPCODES.DONG,
      OPCODES.DING,
      OPCODES.STICKS,
      OPCODES.TACK,
      OPCODES.TICK,
      OPCODES.TOCK,
      OPCODES.PLAY,
      OPCODES.NONE,
    ]

    const ix = precedence.indexOf(p.op)
    const jx = precedence.indexOf(q.op)

    return ix - jx
  })
}

// remove redundant ops
function prune(script) {
  const suffix = (op) => {
    switch (op.op) {
      case OPCODES.TICK:
      case OPCODES.TOCK:
      case OPCODES.TACK:
      case OPCODES.STICKS:
      case OPCODES.SKIP:
        return 'play'

      default:
        return `${op.op}`
    }
  }

  const set = new Map()
  for (const op of script.script) {
    const key = `${op.at.measure}:${op.at.beat}:${suffix(op)}`

    if (!set.has(key)) {
      set.set(key, op)
    }
  }

  script.script = [...set.values()]
}

// combine sequential measures into measure ranges
function compact(script) {
  // ... collect measures with the same beat+op
  const set = new Map()

  for (const op of script.script) {
    const key = `${op.at.beat}::${op.op}`

    if (set.has(key)) {
      set.get(key).measures.push(op.at.measure)
    } else {
      set.set(key, { measures: [op.at.measure], beat: op.at.beat, op: op.op })
    }
  }

  // ... build list of consecutive measures
  const list = []

  for (const v of set.values()) {
    const ranges = []
    let range = []
    let ix = 0

    while (ix < v.measures.length) {
      const m = v.measures[ix]
      ix++

      if (isNaN(m)) {
        ranges.push(range)
        range = []
      } else if (range.length > 0 && m != range[range.length - 1] + 1) {
        ranges.push(range)
        range = [m]
      } else {
        range.push(m)
      }
    }

    if (range.length > 0) {
      ranges.push(range)
    }

    // prettier-ignore
    ranges
      .filter((r) => r.length >= 5)
      .forEach((r) => list.push({ measures: r, beat: v.beat, op: v.op }))
  }

  // ... replace in script
  list.forEach((range) => {
    const r = [range.measures[0], range.measures[range.measures.length - 1]]
    for (const op of script.script) {
      if (range.measures.includes(op.at.measure) && op.at.beat === range.beat && op.op === range.op) {
        op.at.measure = r
      }
    }
  })

  // ... prune redundant entries
  prune(script)
}
