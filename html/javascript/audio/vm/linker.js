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

    return compare(beat.p, beat.q)
  })
}

// remove redundant ops
function prune(script) {
  const set = new Map()
  for (const op of script.script) {
    const key = `${op.at.measure}:${op.at.beat}`

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
