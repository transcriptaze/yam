import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as compiler from '../../html/javascript/audio/vm/compiler.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'

describe('compile: basic track', function () {
  it('1:4, 120BPM, quarter notes', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '2:4',
      pulse: 'quarter',
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('2:4, 120BPM, quarter notes', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '2:4',
      pulse: 'quarter',
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('3:4, 120BPM, quarter notes', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '3:4',
      pulse: 'quarter',
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('4:4, 120BPM, quarter notes', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('5:4, 120BPM, quarter notes', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '5:4',
      pulse: 'quarter',
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('compile: track with delay', function () {
  it('no delay', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          name: 'count-in',
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('1250ms delay', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          name: 'count-in',
          delay: 1250,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 1250,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('compile: track with sections', function () {
  it('unspecified measures', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: 'unspecified measures',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          name: 'verse',
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('8 bars, no loops', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: '8 bars of 4:4 @120BPM',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          name: 'verse',
          measures: 8,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure:   9, beat: 1   }, op: OPCODES.STOP },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})
