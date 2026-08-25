import { OPCODES } from './constants.js'

export function compile(track) {
  const ops = []

  // ... bars
  const sections = track?.sections ?? []

  if (sections.length > 0) {
    const bars = sections.reduce((N, section) => {
      const measures = section.measures ?? Number.POSITIVE_INFINITY

      return N + measures
    }, 0)

    if (bars !== Number.POSITIVE_INFINITY) {
      ops.push({ at: { measure: bars + 1, beat: 1 }, op: OPCODES.STOP })
    }
  }

  // ... default
  ops.push({ at: { measure: '*', beat: 1 }, op: OPCODES.TICK })
  ops.push({ at: { measure: '*', beat: '*' }, op: OPCODES.TOCK })

  return {
    delay: 0,
    script: ops,
  }
}
