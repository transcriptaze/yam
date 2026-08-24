import { OPCODES } from './constants.js'

export function compile(_track) {
  // prettier-ignore
  const ops = [
        // { at: { measure: 5,   beat: 1   }, op: OPCODES.STOP },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
  ]

  return {
    delay: 0,
    script: ops,
  }
}
