import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Klock } from '../../../html/javascript/audio/worklets/klock.js'

describe('tests klock.tock', function () {
  it('4:4, quarter notes, 60BPM, 1kHz, 128 samples', function () {
    // prettier-ignore
    const tests = [
      { tick: 0, expected: { click: true,  bar: 1, beat: 1   } },
      { tick: 1, expected: { click: false, bar: 1, beat: 1   } },
      { tick: 2, expected: { click: false, bar: 1, beat: 1   } },
      { tick: 3, expected: { click: true,  bar: 1, beat: 1.5 } },
      { tick: 4, expected: { click: false, bar: 1, beat: 1.5 } },
      { tick: 5, expected: { click: false, bar: 1, beat: 1.5 } },
      { tick: 6, expected: { click: false, bar: 1, beat: 1.5 } },

      { tick: 7,  expected: { click: true,  bar: 1, beat: 2   } },
      { tick: 8,  expected: { click: false, bar: 1, beat: 2   } },
      { tick: 9,  expected: { click: false, bar: 1, beat: 2   } },
      { tick: 10, expected: { click: false, bar: 1, beat: 2   } },
      { tick: 11, expected: { click: true,  bar: 1, beat: 2.5 } },
      { tick: 12, expected: { click: false, bar: 1, beat: 2.5 } },
      { tick: 13, expected: { click: false, bar: 1, beat: 2.5 } },
      { tick: 14, expected: { click: false, bar: 1, beat: 2.5 } },

      { tick: 15, expected: { click: true,  bar: 1, beat: 3   } },
      { tick: 16, expected: { click: false, bar: 1, beat: 3   } },
      { tick: 17, expected: { click: false, bar: 1, beat: 3   } },
      { tick: 18, expected: { click: false, bar: 1, beat: 3   } },
      { tick: 19, expected: { click: true,  bar: 1, beat: 3.5 } },
      { tick: 20, expected: { click: false, bar: 1, beat: 3.5 } },
      { tick: 21, expected: { click: false, bar: 1, beat: 3.5 } },
      { tick: 22, expected: { click: false, bar: 1, beat: 3.5 } },

      { tick: 23, expected: { click: true,  bar: 1, beat: 4   } },
      { tick: 24, expected: { click: false, bar: 1, beat: 4   } },
      { tick: 25, expected: { click: false, bar: 1, beat: 4   } },
      { tick: 26, expected: { click: false, bar: 1, beat: 4   } },
      { tick: 27, expected: { click: true,  bar: 1, beat: 4.5 } },
      { tick: 28, expected: { click: false, bar: 1, beat: 4.5 } },
      { tick: 29, expected: { click: false, bar: 1, beat: 4.5 } },
      { tick: 30, expected: { click: false, bar: 1, beat: 4.5 } },

      { tick: 31, expected: { click: true,  bar: 2, beat: 1   } },
      { tick: 32, expected: { click: false, bar: 2, beat: 1   } },
      { tick: 33, expected: { click: false, bar: 2, beat: 1   } },
      { tick: 34, expected: { click: false, bar: 2, beat: 1   } },
      { tick: 35, expected: { click: true,  bar: 2, beat: 1.5 } },
      { tick: 36, expected: { click: false, bar: 2, beat: 1.5 } },
      { tick: 37, expected: { click: false, bar: 2, beat: 1.5 } },
      { tick: 38, expected: { click: false, bar: 2, beat: 1.5 } },

      { tick: 39, expected: { click: true,  bar: 2, beat: 2   } },
      { tick: 40, expected: { click: false, bar: 2, beat: 2   } },
    ]

    const clock = new Klock()

    clock.fs = 1000
    clock.buffersize = 128

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        clock.tick(60, 4)
        tick++
      }

      const tock = clock.tick(60, 4)
      tick++

      expect(tock, `>>> tick ${test.tick}`).to.deep.equal(test.expected)
    }
  })
})
