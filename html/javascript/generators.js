import { ROLES, OTHER, DEFAULT } from './constants.js'

const SPECIAL = new Set(['count-in', 'anacrusis', 'intro', 'outro', 'turnaround'])

function* name(role) {
  const label = ROLES.get(role)?.name ?? 'Section'
  let count = 1

  while (true) {
    if (count == 1 && SPECIAL.has(role)) {
      yield `${label}`
    } else {
      yield `${label} #${count++}`
    }
  }
}

export function names() {
  const m = new Map([...Array.from(ROLES.keys(), (key) => [key, name(key)]), ['section', name('section')]])

  return (name, role) => {
    const f = m.get('section')
    const g = m.get(role)

    if (['count-in', 'anacrusis'].includes(role)) {
      const n = g?.next().value ?? ''

      return name ?? n
    }

    const section = f.next().value

    if (role === 'section') {
      return name ?? section
    } else {
      const n = g?.next().value ?? section

      return name ?? n
    }
  }
}

function* role() {
  let count = 0

  while (true) {
    yield `role #${(count++ % 4) + 1}`
  }
}

export function roles() {
  const g = role()

  return (role) => {
    return ROLES.has(role) ? role : g.next().value
  }
}

function* colour(role) {
  let count = 0
  let index = 0

  while (true) {
    const list = ROLES.get(role)?.colour ?? [OTHER.COLOURS[count++ % OTHER.COLOURS.length].colour]
    const ix = index++ % list.length

    yield list[ix]
  }
}

export function colours() {
  const m = new Map([...Array.from(ROLES.keys(), (key) => [key, colour(key)]), ['section', colour('section')]])

  return (colour, role) => {
    const g = m.get(role) ?? m.get('section')
    const c = g?.next().value ?? DEFAULT.COLOUR

    return colour ?? c
  }
}

export function clicks(v) {
  if (v != null && Array.isArray(v)) {
    return v
  }

  if (v != null && v instanceof Object) {
    return new Map(Object.entries(v))
  }

  return null
}

export function* transmogrify(track) {
  const sections = track?.sections ?? []
  const _roles = roles()
  const _names = names()
  const _colours = colours()
  const _clicks = clicks

  let ID = 0
  let tempo = track?.tempo ?? 120
  let timeSignature = track?.timeSignature ?? '4:4'
  let pulse = track?.pulse ?? ''
  let start = 1

  for (const section of sections) {
    const _subsections = section.subsections ?? []

    ID++
    tempo = section.tempo ?? tempo
    timeSignature = section.timeSignature ?? timeSignature
    pulse = section.pulse ?? pulse

    const role = _roles(section.role)
    const name = _names(section.name, role)
    const colour = _colours(section.colour, role)
    const clicks = ['count-in', 'anacrusis'].includes(role) ? _clicks(section.clicks) : (_clicks(section.clicks) ?? _clicks(track.clicks))
    const subsections = []

    if (_subsections.length == 0) {
      const bars = section.measures ?? (['count-in', 'anacrusis'].includes(role) ? 1 : Number.POSITIVE_INFINITY)

      subsections.push({
        start: start,
        measures: bars,
        timeSignature: timeSignature,
        pulse: pulse,
        tempo: tempo,
        clicks: clicks,
      })

      start += bars
    } else {
      for (const subsection of _subsections) {
        const bars = subsection.measures ?? Number.POSITIVE_INFINITY

        timeSignature = subsection.timeSignature ?? timeSignature
        pulse = subsection.pulse ?? pulse
        tempo = subsection.tempo ?? tempo

        subsections.push({
          start: start,
          measures: bars,
          timeSignature: timeSignature,
          pulse: pulse,
          tempo: tempo,
          clicks: _clicks(subsection.clicks) ?? clicks,
        })

        start += bars
      }
    }

    const bars = subsections.reduce((measures, v) => measures + v.measures, 0)

    yield {
      ID: ID,
      role: role,
      name: name,
      colour: colour,
      timeSignature: subsections[0].timeSignature,
      subsections: subsections,
      measures: bars,
      start: subsections[0].start,
    }
  }
}
