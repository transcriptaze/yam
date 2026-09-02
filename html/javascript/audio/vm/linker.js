export function link(script) {
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
