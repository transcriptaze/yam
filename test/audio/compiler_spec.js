import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as compiler from '../../html/javascript/audio/vm/compiler.js'
import * as linker from '../../html/javascript/audio/vm/linker.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'

describe('no track', function () {
  it('1:4, 120BPM, quarter notes', function () {
    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(null)

    expect(script).to.deep.equal(expected)
  })
})

describe('basic track', function () {
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

describe('track with delay', function () {
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

describe('stop', function () {
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

describe('dings', function () {
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
        { at: { measure: 2,   beat: 3.5 }, op: OPCODES.DONG },
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
        { at: { measure: 4,   beat: 3.5 }, op: OPCODES.DONG },
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
        { at: { measure: 13,  beat: 3.5 }, op: OPCODES.DONG },
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
        { at: { measure: 12,  beat: 4   }, op: OPCODES.DONG },
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
        { at: { measure: 4,   beat: 3.5 }, op: OPCODES.DONG },
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
        { at: { measure: 2,   beat: 3.25 }, op: OPCODES.DONG },
        { at: { measure: 2,   beat: 3.75 }, op: OPCODES.DONG },
        { at: { measure: 5,   beat: 4.5  }, op: OPCODES.DONG },
        { at: { measure: 7,   beat: 1    }, op: OPCODES.DONG },
        { at: { measure: '*', beat: 1    }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*'  }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('count-in', function () {
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

describe('anacrusis', function () {
  it('1 bar default pickup @start', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'anacrusis',
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
        { at: { measure: 1,   beat: 4   }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('2 bar default pickup @start', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'anacrusis',
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
        { at: { measure: 2,   beat: 4   }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('1 bar default pickup somewhere in the middle', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'verse',
          measures: 4,
        },
        {
          role: 'anacrusis',
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
        { at: { measure: 5,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: 5,   beat: 4   }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('2 bar default pickup somewhere in the middle', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'verse',
          measures: 4,
        },
        {
          role: 'anacrusis',
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
        { at: { measure: 5,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: 6,   beat: '*' }, op: OPCODES.STICKS },
        { at: { measure: 6,   beat: 4   }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('1 bar pickup with on-beat clicks', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'anacrusis',
          measures: 1,
          clicks: [3, 4],
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
        { at: { measure: 1,   beat: 3   }, op: OPCODES.TOCK },
        { at: { measure: 1,   beat: 4   }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('1 bar pickup with off-beat clicks', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'anacrusis',
          measures: 1,
          clicks: [4.5],
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
        { at: { measure: 1,   beat: 4.5 }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('tempo', function () {
  it('120 BPM to 80BPM', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
        },
        {
          measures: 4,
          tempo: 80,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 9,   beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 5,   beat: 1   }, op: OPCODES.TEMPO, tempo: 80 },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('time signature', function () {
  it('4:4 to 3:4', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
        },
        {
          measures: 4,
          timeSignature: '3:4',
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 9,   beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 5,   beat: 1   }, op: OPCODES.TIME_SIGNATURE, timeSignature: { beats:3, divisions:4 } },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('subdivisions', function () {
  it('quarter notes to eighth doublets', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
        },
        {
          measures: 4,
          pulse: 'eighth-doublet',
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 9,   beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 5,   beat: 1   }, op: OPCODES.SUBDIVISIONS, subdivisions: 'eighth-doublet' },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})

describe('clicks', function () {
  it('section: beats array', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
          clicks: [1, 4],
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 5, beat: 1   }, op: OPCODES.STOP },

        { at: { measure: 1, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 1, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 1, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 2, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 2, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 2, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 3, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 3, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 3, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 4, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 4, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 4, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('section: beats array, infinite measures', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          clicks: [1, 4],
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('section: beats map', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
          clicks: {
            1: 'sticks',
            3: 'tack',
            4: 'ding',
          },
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 5, beat: 1   }, op: OPCODES.STOP },

        { at: { measure: 1, beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 1, beat: 3   }, op: OPCODES.TACK   },
        { at: { measure: 1, beat: 4   }, op: OPCODES.DING   },
        { at: { measure: 1, beat: '*' }, op: OPCODES.SKIP   },

        { at: { measure: 2, beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 2, beat: 3   }, op: OPCODES.TACK   },
        { at: { measure: 2, beat: 4   }, op: OPCODES.DING   },
        { at: { measure: 2, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 3, beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 3, beat: 3   }, op: OPCODES.TACK   },
        { at: { measure: 3, beat: 4   }, op: OPCODES.DING   },
        { at: { measure: 3, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 4, beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 4, beat: 3   }, op: OPCODES.TACK   },
        { at: { measure: 4, beat: 4   }, op: OPCODES.DING   },
        { at: { measure: 4, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('section: beats map, infinite measures', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          clicks: {
            1: 'sticks',
            3: 'tack',
            4: 'ding',
          },
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: '*', beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: '*', beat: 3   }, op: OPCODES.TACK   },
        { at: { measure: '*', beat: 4   }, op: OPCODES.DING   },
        { at: { measure: '*', beat: '*' }, op: OPCODES.SKIP   },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('track: beats array', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      clicks: [1, 4],
      sections: [
        {
          measures: 4,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 5,   beat: 1   }, op: OPCODES.STOP },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: 4   }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('track: beats map', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      clicks: {
        1: 'sticks',
        4: 'tack',
      },
      sections: [
        {
          measures: 4,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 5,   beat: 1   }, op: OPCODES.STOP },

        { at: { measure: '*', beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: '*', beat: 4   }, op: OPCODES.TACK   },
        { at: { measure: '*', beat: '*' }, op: OPCODES.SKIP   },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('track + section clicks', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      clicks: {
        1: 'sticks',
        4: 'tack',
      },
      sections: [
        {
          measures: 4,
        },
        {
          measures: 4,
          clicks: {
            2: 'ding',
            3: 'tock',
          },
        },
        {
          measures: 4,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 5, beat: 2   }, op: OPCODES.DING },
        { at: { measure: 5, beat: 3   }, op: OPCODES.TOCK },
        { at: { measure: 5, beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 6, beat: 2   }, op: OPCODES.DING },
        { at: { measure: 6, beat: 3   }, op: OPCODES.TOCK },
        { at: { measure: 6, beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 7, beat: 2   }, op: OPCODES.DING },
        { at: { measure: 7, beat: 3   }, op: OPCODES.TOCK },
        { at: { measure: 7, beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 8, beat: 2   }, op: OPCODES.DING },
        { at: { measure: 8, beat: 3   }, op: OPCODES.TOCK },
        { at: { measure: 8, beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 13,  beat: 1   }, op: OPCODES.STOP },

        { at: { measure: '*', beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: '*', beat: 4   }, op: OPCODES.TACK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.SKIP },
      ],
    }

    const script = compiler.compile(track)

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })
})

describe('subsections', function () {
  it('tempo', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
        },
        {
          subsections: [
            {
              measures: 4,
              tempo: 80,
            },
          ],
        },
        {
          measures: 4,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 13,  beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 5,   beat: 1   }, op: OPCODES.TEMPO, tempo: 80 },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('time signature', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
        },
        {
          subsections: [
            {
              measures: 4,
              timeSignature: '5:4',
            },
          ],
        },
        {
          measures: 4,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 13,  beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 5,   beat: 1   }, op: OPCODES.TIME_SIGNATURE, timeSignature: { beats:5, divisions:4 } },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('subdivisions', function () {
    const track = {
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          measures: 4,
        },
        {
          subsections: [
            {
              measures: 4,
              pulse: 'dotted-quarter',
            },
          ],
        },
        {
          measures: 4,
        },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 13,  beat: 1   }, op: OPCODES.STOP },
        { at: { measure: 5,   beat: 1   }, op: OPCODES.SUBDIVISIONS, subdivisions: 'dotted-quarter' },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})
