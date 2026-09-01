import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as linker from '../../html/javascript/audio/vm/linker.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'

describe('linker: link', function () {
  it('sort measures into executable order', function () {
    // prettier-ignore
    const script = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
        { at: { measure: 2,   beat: '*' }, op: OPCODES.TOCK },
        { at: { measure: 3,   beat: '*' }, op: OPCODES.TOCK },
        { at: { measure: 1,   beat: '*' }, op: OPCODES.STICKS },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 1,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: 2,   beat: '*' }, op: OPCODES.TOCK },
        { at: { measure: 3,   beat: '*' }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })

  it('sort measure:* beats into executable order', function () {
    // prettier-ignore
    const script = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: '*' }, op: OPCODES.TICK },
        { at: { measure: '*', beat: 2.5 }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 2   }, op: OPCODES.TACK },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 2   }, op: OPCODES.TACK },
        { at: { measure: '*', beat: 2.5 }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TICK },
      ],
    }

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })

  it('sort measure:N beats into executable order', function () {
    // prettier-ignore
    const script = {
      delay: 0,
      script: [
        { at: { measure: 4, beat: '*' }, op: OPCODES.TICK },
        { at: { measure: 4, beat: 2.5 }, op: OPCODES.TOCK },
        { at: { measure: 4, beat: 2   }, op: OPCODES.TACK },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 4, beat: 2   }, op: OPCODES.TACK },
        { at: { measure: 4, beat: 2.5 }, op: OPCODES.TOCK },
        { at: { measure: 4, beat: '*' }, op: OPCODES.TICK },
      ],
    }

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })

  it('sort anacruses into executable order', function () {
    // prettier-ignore
    const script = {
      delay: 0,
      script: [
        { at: { measure: 1,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: 1,   beat: 4.5 }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 1,   beat: 4.5 }, op: OPCODES.TOCK },
        { at: { measure: 1,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })
})
