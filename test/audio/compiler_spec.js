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

describe('compile: stop', function () {
  it('unspecified measures', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
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

describe('compile: dings', function () {
  it('track dings', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      dings: ['2:3.5'],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 2,   beat: 3.5 }, op: OPCODES.DING },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('section dings', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          name: 'verse',
          measures: 8,
          dings: ['4:3.5'],
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 9,   beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 4,   beat: 3.5 }, op: OPCODES.DING },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('multi-section dings', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          name: 'verse',
          measures: 8,
        },
        {
          name: 'verse',
          measures: 8,
          dings: ['5:3.5'],
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 17,  beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 13,  beat: 3.5 }, op: OPCODES.DING },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('out-of-range dings', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          name: 'verse',
          measures: 8,
        },
        {
          name: 'verse',
          measures: 4,
          dings: ['5:3.5', '4:4'],
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 13,  beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 12,  beat: 4   }, op: OPCODES.DING },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('duplicate dings', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      dings: ['4:3.5'],
      sections: [
        {
          name: 'verse',
          measures: 8,
          dings: ['4:3.5'],
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 9,   beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 4,   beat: 3.5 }, op: OPCODES.DING },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('unordered dings', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      dings: ['5:4.5'],
      sections: [
        {
          name: 'verse',
          measures: 8,
          dings: ['7:1', '2:3.75', '2:3.25'],
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 9,   beat: 1    }, op: OPCODES.STOP },
        { at: { measure: 2,   beat: 3.25 }, op: OPCODES.DING },
        { at: { measure: 2,   beat: 3.75 }, op: OPCODES.DING },
        { at: { measure: 5,   beat: 4.5  }, op: OPCODES.DING },
        { at: { measure: 7,   beat: 1    }, op: OPCODES.DING },
        { at: { measure: '*', beat: 1    }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*'  }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('compile: count-in', function () {
  it('4:4, 1 bar count-in', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'count-in',
          measures: 1,
        },
        {
          role: 'verse',
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 1,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('4:4, 2 bar count-in', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'count-in',
          measures: 2,
        },
        {
          role: 'verse',
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 1,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: 2,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})
