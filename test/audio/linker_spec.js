import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as linker from '../../html/javascript/audio/vm/linker.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'

describe('linker: sort', function () {
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

describe('linker: optimize', function () {
  it('remove redundant ops', function () {
    // prettier-ignore
    const script = {
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

    // prettier-ignore
    const expected = {
      delay: 0,
      script: [
        { at: { measure: 5,   beat: 1   }, op: OPCODES.STOP },
        { at: { measure: '*', beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: '*', beat: 4   }, op: OPCODES.TACK   },
        { at: { measure: '*', beat: '*' }, op: OPCODES.SKIP   },
      ],
    }

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })

  it('measure ranges', function () {
    // prettier-ignore
    const script = {
      delay: 0,
      loops: Number.POSITIVE_INFINITY,
      script: [
        { at: { measure: 6, beat: 1   }, op: OPCODES.STOP },

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

        { at: { measure: 5, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 5, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 5, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      loops: Number.POSITIVE_INFINITY,
      script: [
        { at: { measure: [1,5], beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: [1,5], beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: [1,5], beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 6, beat: 1   }, op: OPCODES.STOP },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })

  it('multiple measure ranges', function () {
    // prettier-ignore
    const script = {
      delay: 0,
      loops: Number.POSITIVE_INFINITY,
      script: [
        { at: { measure: 12, beat: 1   }, op: OPCODES.STOP },

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

        { at: { measure: 5, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 5, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 5, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 6, beat: 1   }, op: OPCODES.TACK },

        { at: { measure: 7, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 7, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 7, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 8, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 8, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 8, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 9, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 9, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 9, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 10, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 10, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 10, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 11, beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: 11, beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: 11, beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    // prettier-ignore
    const expected = {
      delay: 0,
      loops: Number.POSITIVE_INFINITY,
      script: [
        { at: { measure: [1,5], beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: [1,5], beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: [1,5], beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 6, beat: 1   }, op: OPCODES.TACK },

        { at: { measure: [7,11], beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: [7,11], beat: 4   }, op: OPCODES.TOCK  },
        { at: { measure: [7,11], beat: '*' }, op: OPCODES.SKIP  },

        { at: { measure: 12, beat: 1   }, op: OPCODES.STOP },

        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK  },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK  },
      ],
    }

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })
})
