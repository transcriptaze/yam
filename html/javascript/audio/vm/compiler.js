import { OPCODES } from './constants.js'

export function compile(json) {
  const track = JSON.parse(json)

  // prettier-ignore
  const re = /([1-9][0-9]*):(4)/
  const match = track.timeSignature.match(re)
  const beats = parseInt(match[1])
  // const divisions = parseInt(match[2])

  // prettier-ignore
  const ops = []

  for (let beat = 1; beat <= beats; beat++) {
    switch (beat) {
      case 1:
        ops.push({ beat: 1, op: OPCODES.TICK })
        break

      default:
        ops.push({ beat: beat, op: OPCODES.TOCK })
    }
  }

  return ops
}
