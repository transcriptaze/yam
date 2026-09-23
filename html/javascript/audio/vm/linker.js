export function link(script) {
  // ... sort ops into measure + beat order
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

  // ... remove redundant ops
  const set = new Map()
  for (const op of script.script) {
    const key = `${op.at.measure}:${op.at.beat}`

    if (!set.has(key)) {
      set.set(key, op)
    }
  }

  script.script = [...set.values()]
}

function compare(p, q) {
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
