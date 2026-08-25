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

  // ... bars
  if (sections.length > 0) {
    const bars = sections.reduce((N, section) => {
      const measures = section.measures ?? Number.POSITIVE_INFINITY

      return N + measures
    }, 0)

    if (bars !== Number.POSITIVE_INFINITY) {
      script.script.push({ at: { measure: bars + 1, beat: 1 }, op: OPCODES.STOP })
    }
  }

  // ... default
  script.script.push({ at: { measure: '*', beat: 1 }, op: OPCODES.TICK })
  script.script.push({ at: { measure: '*', beat: '*' }, op: OPCODES.TOCK })

  return script
}
