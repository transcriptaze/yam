import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Klock } from '../../../html/javascript/audio/worklets/klock.js'

describe('tests klock.tick', function () {
  it('4:4, quarter notes, 60BPM, 1kHz, 128 samples', function () {
    const fs = 1000
    const buffersize = 128
    const BPM = 60
    const tactus = 4

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

    const clock = new Klock(fs, buffersize, BPM, tactus)

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        clock.tick(BPM, tactus)
        tick++
      }

      const tock = clock.tick(BPM, tactus)
      tick++

      expect(tock, `>>> tick ${test.tick}`).to.deep.equal(test.expected)
    }
  })

  it('3:4, quarter notes, 60BPM, 1kHz, 128 samples', function () {
    const fs = 1000
    const buffersize = 128
    const BPM = 60
    const tactus = 3

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

      { tick: 23, expected: { click: true,  bar: 2, beat: 1   } },
      { tick: 24, expected: { click: false, bar: 2, beat: 1   } },
      { tick: 25, expected: { click: false, bar: 2, beat: 1   } },
      { tick: 26, expected: { click: false, bar: 2, beat: 1   } },
      { tick: 27, expected: { click: true,  bar: 2, beat: 1.5 } },
      { tick: 28, expected: { click: false, bar: 2, beat: 1.5 } },
      { tick: 29, expected: { click: false, bar: 2, beat: 1.5 } },
      { tick: 30, expected: { click: false, bar: 2, beat: 1.5 } },

      { tick: 31, expected: { click: true,  bar: 2, beat: 2   } },
      { tick: 32, expected: { click: false, bar: 2, beat: 2   } },
      { tick: 33, expected: { click: false, bar: 2, beat: 2   } },
      { tick: 34, expected: { click: false, bar: 2, beat: 2   } },
      { tick: 35, expected: { click: true,  bar: 2, beat: 2.5 } },
      { tick: 36, expected: { click: false, bar: 2, beat: 2.5 } },
      { tick: 37, expected: { click: false, bar: 2, beat: 2.5 } },
      { tick: 38, expected: { click: false, bar: 2, beat: 2.5 } },

      { tick: 39, expected: { click: true,  bar: 2, beat: 3   } },
      { tick: 40, expected: { click: false, bar: 2, beat: 3   } },
    ]

    const clock = new Klock(fs, buffersize, BPM, tactus)

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        clock.tick(BPM, tactus)
        tick++
      }

      const tock = clock.tick(BPM, tactus)
      tick++

      expect(tock, `>>> tick ${test.tick}`).to.deep.equal(test.expected)
    }
  })

  it('4:4, quarter notes, 120BPM, 1kHz, 128 samples', function () {
    const fs = 1000
    const buffersize = 128
    const BPM = 120
    const tactus = 4

    // prettier-ignore
    const tests = [
      { tick: 0, expected: { click: true,  bar: 1, beat: 1   } }, // 0   - 127ms
      { tick: 1, expected: { click: true,  bar: 1, beat: 1.5 } }, // 128 - 255ms
      { tick: 2, expected: { click: false, bar: 1, beat: 1.5 } }, // 256 - 383ms
      { tick: 3, expected: { click: true,  bar: 1, beat: 2   } }, // 383 - 511ms
      { tick: 4, expected: { click: false, bar: 1, beat: 2   } }, // 512 - 639ms
      { tick: 5, expected: { click: true,  bar: 1, beat: 2.5 } }, // 640 - 767ms
      { tick: 6, expected: { click: false, bar: 1, beat: 2.5 } }, // 768 - 895ms

      { tick: 7,  expected: { click: true,  bar: 1, beat: 3   } }, // 896 - 1023ms
      { tick: 8,  expected: { click: false, bar: 1, beat: 3   } },
      { tick: 9,  expected: { click: true,  bar: 1, beat: 3.5 } },
      { tick: 10, expected: { click: false, bar: 1, beat: 3.5 } },
      { tick: 11, expected: { click: true,  bar: 1, beat: 4   } },
      { tick: 12, expected: { click: false, bar: 1, beat: 4   } },
      { tick: 13, expected: { click: true,  bar: 1, beat: 4.5 } },
      { tick: 14, expected: { click: false, bar: 1, beat: 4.5 } },

      { tick: 15, expected: { click: true,  bar: 2, beat: 1   } },
      { tick: 16, expected: { click: false, bar: 2, beat: 1   } },
      { tick: 17, expected: { click: true,  bar: 2, beat: 1.5 } },
      { tick: 18, expected: { click: false, bar: 2, beat: 1.5 } },
      { tick: 19, expected: { click: true,  bar: 2, beat: 2 } },
      { tick: 20, expected: { click: false, bar: 2, beat: 2 } },
      { tick: 21, expected: { click: true,  bar: 2, beat: 2.5 } },
      { tick: 22, expected: { click: false, bar: 2, beat: 2.5 } },

      { tick: 23, expected: { click: true,  bar: 2, beat: 3   } },
      { tick: 24, expected: { click: false, bar: 2, beat: 3   } },
      { tick: 25, expected: { click: true,  bar: 2, beat: 3.5 } },
      { tick: 26, expected: { click: false, bar: 2, beat: 3.5 } },
      { tick: 27, expected: { click: true,  bar: 2, beat: 4   } },
      { tick: 28, expected: { click: false, bar: 2, beat: 4   } },
      { tick: 29, expected: { click: true,  bar: 2, beat: 4.5 } },
      { tick: 30, expected: { click: false, bar: 2, beat: 4.5 } },

      { tick: 31, expected: { click: true,  bar: 3, beat: 1   } },
      { tick: 32, expected: { click: false, bar: 3, beat: 1   } },
      { tick: 33, expected: { click: true,  bar: 3, beat: 1.5 } },
      { tick: 34, expected: { click: false, bar: 3, beat: 1.5 } },
      { tick: 35, expected: { click: true,  bar: 3, beat: 2   } },
      { tick: 36, expected: { click: false, bar: 3, beat: 2   } },
      { tick: 37, expected: { click: true,  bar: 3, beat: 2.5 } },
      { tick: 38, expected: { click: false, bar: 3, beat: 2.5 } },

      { tick: 39, expected: { click: true,  bar: 3, beat: 3   } },
      { tick: 40, expected: { click: false, bar: 3, beat: 3   } },
    ]

    const clock = new Klock(fs, buffersize, BPM, tactus)

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        clock.tick(BPM, tactus)
        tick++
      }

      const tock = clock.tick(BPM, tactus)
      tick++

      expect(tock, `>>> tick ${test.tick}`).to.deep.equal(test.expected)
    }
  })
})
