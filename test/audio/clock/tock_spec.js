import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Clock } from '../../../html/javascript/audio/worklets/clock.js'
import { EIGHTH, EIGHTH_DOUBLET, QUARTER, DOTTED_QUARTER } from '../../../html/javascript/audio/shared/constants.js'

describe('tests clock.tock', function () {
  it('4:4, quarter notes, 60BPM, 1kHz, 128 samples', function () {
    const tests = [
      { tick: 0, expected: { click: true, bar: 1, beat: 1 } },
      { tick: 1, expected: { click: false, bar: 1, beat: 1 } },

      { tick: 6, expected: { click: false, bar: 1, beat: 1 } },
      { tick: 7, expected: { click: true, bar: 1, beat: 2 } },
      { tick: 8, expected: { click: false, bar: 1, beat: 2 } },

      { tick: 14, expected: { click: false, bar: 1, beat: 2 } },
      { tick: 15, expected: { click: true, bar: 1, beat: 3 } },
      { tick: 16, expected: { click: false, bar: 1, beat: 3 } },

      { tick: 22, expected: { click: false, bar: 1, beat: 3 } },
      { tick: 23, expected: { click: true, bar: 1, beat: 4 } },
      { tick: 24, expected: { click: false, bar: 1, beat: 4 } },

      { tick: 30, expected: { click: false, bar: 1, beat: 4 } },
      { tick: 31, expected: { click: true, bar: 2, beat: 1 } },
      { tick: 32, expected: { click: false, bar: 2, beat: 1 } },
    ]

    const clock = new Clock()

    clock.fs = 1000

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        clock.cluck(tick, 60, 4)
        tick++
      }

      const tock = clock.cluck(tick, 60, 4)
        tick++

      expect(tock,`>>> tick ${test.tick}`).to.deep.equal(test.expected)
    }
  })
})
