import { describe, it } from 'mocha'
import { expect } from 'chai'
import { VM } from '../../html/javascript/audio/vm/vm.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'
import {
  EIGHTH_NOTES,
  EIGHTH_DOUBLETS,
  EIGHTH_TRIPLETS,
  QUARTER_NOTES,
  DOTTED_QUARTER_NOTES,
  HALF_NOTES,
} from '../../html/javascript/audio/vm/constants.js'

const FS = 44100
const BUFFERSIZE = 128
const BPM = 120

describe('tests VM.tick', function () {
  it('tick fs:44100, buffer:128, delay:0', function () {
    // prettier-ignore
    const tests = [
      { tick: 0,   time:    0.0000 },
      { tick: 1,   time:    2.9025 },
      { tick: 2,   time:    5.8050 },
      { tick: 3,   time:    8.7075 },
      { tick: 4,   time:   11.6100 },
      { tick: 5,   time:   14.5125 },
      { tick: 6,   time:   17.4150 },
      { tick: 7,   time:   20.3175 },
      { tick: 8,   time:   23.2200 },
      { tick: 9,   time:   26.1224 },
      { tick: 10,  time:   29.0249 },
    ]

    // ... setup
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // ... run
    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM, bufferSize)
        tick++
      }

      const { time } = vm.tick(BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
    }
  })

  it('tick fs:48000, buffer:128, delay:0', function () {
    // prettier-ignore
    const tests = [
      { tick: 0,   time:    0.0000 },
      { tick: 1,   time:    2.6667 },
      { tick: 2,   time:    5.3333 },
      { tick: 3,   time:    8.0000 },
      { tick: 4,   time:   10.6667 },
      { tick: 5,   time:   13.3333 },
      { tick: 6,   time:   16.0000 },
      { tick: 7,   time:   18.6667 },
      { tick: 8,   time:   21.3333 },
      { tick: 9,   time:   24.0000 },
      { tick: 10,  time:   26.6667 },
    ]

    // ... setup
    const fs = 48000
    const bufferSize = 128
    const vm = new VM(fs, [])

    // ... run
    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM, bufferSize)
        tick++
      }

      const { time } = vm.tick(BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
    }
  })

  it('tick fs:48000, buffer:64, delay:0', function () {
    // prettier-ignore
    const tests = [
      { tick: 0,   time:    0.0000 },
      { tick: 1,   time:    1.3333 },
      { tick: 2,   time:    2.6667 },
      { tick: 3,   time:    4.0000 },
      { tick: 4,   time:    5.3333 },
      { tick: 5,   time:    6.6667 },
      { tick: 6,   time:    8.0000 },
      { tick: 7,   time:    9.3333 },
      { tick: 8,   time:   10.6667 },
      { tick: 9,   time:   12.0000 },
      { tick: 10,  time:   13.3333 },
    ]

    // ... setup
    const fs = 48000
    const bufferSize = 64
    const vm = new VM(fs, [])

    // ... run
    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM, bufferSize)
        tick++
      }

      const { time } = vm.tick(BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
    }
  })

  it('tick fs:48000, buffer:256, delay:0', function () {
    // prettier-ignore
    const tests = [
      { tick: 0,   time:    0.0000 },
      { tick: 1,   time:    5.3333 },
      { tick: 2,   time:   10.6667 },
      { tick: 3,   time:   16.0000 },
      { tick: 4,   time:   21.3333 },
      { tick: 5,   time:   26.6667 },
      { tick: 6,   time:   32.0000 },
      { tick: 7,   time:   37.3333 },
      { tick: 8,   time:   42.6667 },
      { tick: 9,   time:   48.0000 },
      { tick: 10,  time:   53.3333 },
    ]

    // ... setup
    const fs = 48000
    const bufferSize = 256
    const vm = new VM(fs, [])

    // ... run
    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM, bufferSize)
        tick++
      }

      const { time } = vm.tick(BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
    }
  })

  it('click 40BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:   0,  bpm: 40, time:  0.0000, click: 1 },
      { tick:   1,  bpm: 40, time:  2.9025 },

      { tick: 171,  bpm: 40, time:  496.3265 },
      { tick: 172,  bpm: 40, time:  499.2290, click: 1.333 },
      { tick: 173,  bpm: 40, time:  502.1315 },

      { tick: 257,  bpm: 40, time:  745.9410 },
      { tick: 258,  bpm: 40, time:  748.8435, click: 1.5 },
      { tick: 258,  bpm: 40, time:  751.7460 },

      { tick: 343,  bpm: 40, time:  995.5556 },
      { tick: 344,  bpm: 40, time:  998.4580, click: 1.667 },
      { tick: 345,  bpm: 40, time: 1001.3605 },

      { tick: 515,  bpm: 40, time: 1494.7846 },
      { tick: 516,  bpm: 40, time: 1497.6871, click: 2 },
      { tick: 517,  bpm: 40, time: 1500.5896 },

      { tick: 688,  bpm: 40, time: 1996.9161 },
      { tick: 689,  bpm: 40, time: 1999.8186, click: 2.333 },
      { tick: 690,  bpm: 40, time: 2002.7211 },

      { tick: 774,  bpm: 40, time: 2246.5306 },
      { tick: 775,  bpm: 40, time: 2249.4331, click: 2.5 },
      { tick: 776,  bpm: 40, time: 2252.3356 },

      { tick: 860,  bpm: 40, time: 2496.1451 },
      { tick: 861,  bpm: 40, time: 2499.0476, click: 2.667 },
      { tick: 862,  bpm: 40, time: 2501.9501 },

      { tick: 1032, bpm: 40, time: 2995.3741 },
      { tick: 1033, bpm: 40, time: 2998.2766, click: 3 },
      { tick: 1034, bpm: 40, time: 3001.1791 },
    ]

    cluck(new VM(FS, []), tests)
  })

  it('click 120BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:   0, bpm: 120, time:    0.0000, click: 1 },
      { tick:   1, bpm: 120, time:    2.9025 },

      { tick:  85, bpm: 120, time:   246.7120 },
      { tick:  86, bpm: 120, time:   249.6145, click: 1.5 },
      { tick:  87, bpm: 120, time:   252.5170 },

      { tick: 171, bpm: 120, time:  496.3265 },
      { tick: 172, bpm: 120, time:  499.2290, click: 2  },
      { tick: 173, bpm: 120, time:  502.1315 },

      { tick: 257, bpm: 120, time:  745.9410 },
      { tick: 258, bpm: 120, time:  748.8435, click: 2.5  },
      { tick: 259, bpm: 120, time:  751.7460 },

      { tick: 343, bpm: 120, time:  995.5556 },
      { tick: 344, bpm: 120, time:  998.4580, click: 3 },
      { tick: 345, bpm: 120, time: 1001.3605 },
    ]

    cluck(new VM(FS, []), tests)
  })

  it('click 200BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:   0, bpm: 200, time:   0.0000, click: 1 },
      { tick:   1, bpm: 200, time:   2.9025 },

      { tick:  50, bpm: 200, time: 145.1247 },
      { tick:  51, bpm: 200, time: 148.0272, click: 1.5  },
      { tick:  52, bpm: 200, time: 150.9297 },

      { tick: 102, bpm: 200, time: 296.0544 },
      { tick: 103, bpm: 200, time: 298.9569, click: 2  },
      { tick: 104, bpm: 200, time: 301.8594 },

      { tick: 154, bpm: 200, time: 446.9841 },
      { tick: 155, bpm: 200, time: 449.8866, click: 2.5  },
      { tick: 156, bpm: 200, time: 452.7891 },

      { tick: 205, bpm: 200, time: 595.0113 },
      { tick: 206, bpm: 200, time: 597.9138, click: 3 },
      { tick: 207, bpm: 200, time: 600.8163 },
    ]

    cluck(new VM(FS, []), tests)
  })

  it('click 120BPM -> 40BPM, on the beat', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, bpm: 120, time:    0.0000, click: 1 },
      { tick:    1, bpm: 120, time:    2.9025 },

      { tick:   85, bpm: 120, time:   246.7120 },
      { tick:   86, bpm: 120, time:   249.6145, click: 1.5 },
      { tick:   87, bpm: 120, time:   252.5170 },

      { tick:  171, bpm: 120, time:  496.3265 },
      { tick:  172, bpm: 120, time:  499.2290, click: 2  },
      { tick:  173, bpm: 120, time:  502.1315 },

      { tick:  257, bpm: 120, time:  745.9410 },
      { tick:  258, bpm: 120, time:  748.8435, click: 2.5  },
      { tick:  259, bpm: 120, time:  751.7460 },

      { tick:  343, bpm: 120, time:  995.5556 },
      { tick:  344, bpm:  40, time:  998.4580, click: 2.333},
      { tick:  345, bpm:  40, time: 1001.3605 },

      { tick:  688, bpm:  40, time: 1996.9161 },
      { tick:  689, bpm:  40, time: 1999.8186, click: 3 },
      { tick:  690, bpm:  40, time: 2002.7211 },

      { tick:  946, bpm:  40, time: 2745.7596 },
      { tick:  947, bpm:  40, time: 2748.6621, click: 3.5 },
      { tick:  946, bpm:  40, time: 2751.5646 },

      { tick: 1204, bpm:  40, time: 3494.6032 },
      { tick: 1205, bpm:  40, time: 3497.5057, click: 4 },
      { tick: 1206, bpm:  40, time: 3500.4082 },
    ]

    cluck(new VM(FS, []), tests)
  })

  it('click 120BPM -> 40BPM, on the half-beat', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, bpm: 120, time:    0.0000, click: 1 },
      { tick:    1, bpm: 120, time:    2.9025 },

      { tick:   85, bpm: 120, time:   246.7120 },
      { tick:   86, bpm: 120, time:   249.6145, click: 1.5 },
      { tick:   87, bpm: 120, time:   252.5170 },

      { tick:  171, bpm: 120, time:  496.3265 },
      { tick:  172, bpm: 120, time:  499.2290, click: 2  },
      { tick:  173, bpm: 120, time:  502.1315 },

      { tick:  257, bpm: 120, time:  745.9410 },
      { tick:  258, bpm:  40, time:  748.8435 },
      { tick:  259, bpm:  40, time:  751.7460 },

      { tick:  429, bpm:  40, time: 1245.1701 },
      { tick:  430, bpm:  40, time: 1248.0726, click: 2.5 },
      { tick:  431, bpm:  40, time: 1250.9751 },

      { tick:  688, bpm:  40, time: 1996.9161 },
      { tick:  689, bpm:  40, time: 1999.8186, click: 3 },
      { tick:  690, bpm:  40, time: 2002.7211 },

      { tick:  946, bpm:  40, time: 2745.7596 },
      { tick:  947, bpm:  40, time: 2748.6621, click: 3.5 },
      { tick:  946, bpm:  40, time: 2751.5646 },

      { tick: 1204, bpm:  40, time: 3494.6032 },
      { tick: 1205, bpm:  40, time: 3497.5057, click: 4 },
      { tick: 1206, bpm:  40, time: 3500.4082 },
    ]

    cluck(new VM(FS, []), tests)
  })

  it('click 120BPM -> 200BPM, on the beat', function () {
    // prettier-ignore
    const tests = [
      { tick:   0, bpm: 120, time:    0.0000, click: 1 },
      { tick:   1, bpm: 120, time:    2.9025 },

      { tick:  85, bpm: 120, time:   246.7120 },
      { tick:  86, bpm: 120, time:   249.6145, click: 1.5 },
      { tick:  87, bpm: 120, time:   252.5170 },

      { tick: 171, bpm: 120, time:  496.3265 },
      { tick: 172, bpm: 120, time:  499.2290, click: 2  },
      { tick: 173, bpm: 120, time:  502.1315 },

      { tick: 257, bpm: 120, time:  745.9410 },
      { tick: 258, bpm: 120, time:  748.8435, click: 2.5  },
      { tick: 259, bpm: 120, time:  751.7460 },

      { tick: 343, bpm: 120, time:  995.5556 },
      { tick: 344, bpm: 200, time:  998.4580, click: 2.333 },
      { tick: 345, bpm: 200, time: 1001.3605 },

      { tick: 377, bpm: 200, time: 1094.2404 },
      { tick: 378, bpm: 200, time: 1097.1429, click: 3 },
      { tick: 379, bpm: 200, time: 1100.0454 },

      { tick: 429, bpm: 200, time: 1245.1701 },
      { tick: 430, bpm: 200, time: 1248.0726, click: 3.5 },
      { tick: 431, bpm: 200, time: 1250.9751 },

      { tick: 481, bpm: 200, time: 1396.0998 },
      { tick: 482, bpm: 200, time: 1399.0023, click: 4 },
      { tick: 483, bpm: 200, time: 1401.9048 },
    ]

    cluck(new VM(FS, []), tests)
  })

  it('click 120BPM -> 200BPM, on the half-beat', function () {
    // prettier-ignore
    const tests = [
      { tick:   0, bpm: 120, time:    0.0000, click: 1 },
      { tick:   1, bpm: 120, time:    2.9025 },

      { tick:  85, bpm: 120, time:   246.7120 },
      { tick:  86, bpm: 120, time:   249.6145, click: 1.5 },
      { tick:  87, bpm: 120, time:   252.5170 },

      { tick: 171, bpm: 120, time:  496.3265 },
      { tick: 172, bpm: 120, time:  499.2290, click: 2  },
      { tick: 173, bpm: 120, time:  502.1315 },

      { tick: 222, bpm: 120, time:  644.3537 },
      { tick: 223, bpm: 200, time:  647.2562, click: 2.5  },
      { tick: 224, bpm: 200, time:  650.1587 },

      { tick: 274, bpm: 200, time: 795.2834},
      { tick: 275, bpm: 200, time: 798.1859, click: 3 },
      { tick: 276, bpm: 200, time: 801.0884 },

      { tick: 326, bpm: 200, time: 946.2132 },
      { tick: 327, bpm: 200, time: 949.1156, click: 3.5 },
      { tick: 328, bpm: 200, time: 952.0181 },

      { tick: 377, bpm: 200, time: 1094.2404 },
      { tick: 378, bpm: 200, time: 1097.1429, click: 4 },
      { tick: 379, bpm: 200, time: 1100.0454 },
    ]

    cluck(new VM(FS, []), tests)
  })

  const cluck = (vm, tests) => {
    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(test.bpm, BUFFERSIZE)
        tick++
      }

      const { time, click } = vm.tick(test.bpm, BUFFERSIZE)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  }
})

describe('tests VM.click, quarter notes', function () {
  it('click 2:4', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, expected: { measure: 1, beat: 1   }},
      {click: 1.5, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, expected: { measure: 1, beat: 2   }},
      {click: 2.5, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, expected: { measure: 2, beat: 1   }},
      {click: 3.5, expected: { measure: 2, beat: 1.5 }},
      {click: 4.0, expected: { measure: 2, beat: 2   }},
      {click: 4.5, expected: { measure: 2, beat: 2.5 }},
      {click: 5.0, expected: { measure: 3, beat: 1   }},
      {click: 5.5, expected: { measure: 3, beat: 1.5 }},
      {click: 6.0, expected: { measure: 3, beat: 2   }},
      {click: 6.5, expected: { measure: 3, beat: 2.5 }},
      {click: 7.0, expected: { measure: 4, beat: 1   }},
      {click: 7.5, expected: { measure: 4, beat: 1.5 }},
      {click: 8.0, expected: { measure: 4, beat: 2   }},
      {click: 8.5, expected: { measure: 4, beat: 2.5 }},
      {click: 9.0, expected: { measure: 5, beat: 1   }},
    ]

    // ... setup
    const timeSignature = { beats: 2, divisions: 4 }
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 3:4', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, expected: { measure: 1, beat: 1   }},
      {click: 1.5, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, expected: { measure: 1, beat: 2   }},
      {click: 2.5, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, expected: { measure: 1, beat: 3   }},
      {click: 3.5, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, expected: { measure: 2, beat: 1   }},
      {click: 4.5, expected: { measure: 2, beat: 1.5 }},
      {click: 5.0, expected: { measure: 2, beat: 2   }},
      {click: 5.5, expected: { measure: 2, beat: 2.5 }},
      {click: 6.0, expected: { measure: 2, beat: 3   }},
      {click: 6.5, expected: { measure: 2, beat: 3.5 }},
      {click: 7.0, expected: { measure: 3, beat: 1   }},
      {click: 7.5, expected: { measure: 3, beat: 1.5 }},
      {click: 8.0, expected: { measure: 3, beat: 2   }},
      {click: 8.5, expected: { measure: 3, beat: 2.5 }},
      {click: 9.0, expected: { measure: 3, beat: 3   }},
    ]

    // ... setup
    const timeSignature = { beats: 3, divisions: 4 }
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 4:4', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, expected: { measure: 1, beat: 1   }},
      {click: 1.5, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, expected: { measure: 1, beat: 2   }},
      {click: 2.5, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, expected: { measure: 1, beat: 3   }},
      {click: 3.5, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, expected: { measure: 1, beat: 4   }},
      {click: 4.5, expected: { measure: 1, beat: 4.5 }},
      {click: 5.0, expected: { measure: 2, beat: 1   }},
      {click: 5.5, expected: { measure: 2, beat: 1.5 }},
      {click: 6.0, expected: { measure: 2, beat: 2   }},
      {click: 6.5, expected: { measure: 2, beat: 2.5 }},
      {click: 7.0, expected: { measure: 2, beat: 3   }},
      {click: 7.5, expected: { measure: 2, beat: 3.5 }},
      {click: 8.0, expected: { measure: 2, beat: 4   }},
      {click: 8.5, expected: { measure: 2, beat: 4.5 }},
      {click: 9.0, expected: { measure: 3, beat: 1   }},
    ]

    // ... setup
    const timeSignature = { beats: 4, divisions: 4 }
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 4:4 -> 3:4 on beat 1', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1   }},
      {click: 1.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2   }},
      {click: 2.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3   }},
      {click: 3.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4   }},
      {click: 4.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4.5 }},
      {click: 5.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 1   }},
      {click: 5.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 1.5 }},
      {click: 6.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 2   }},
      {click: 6.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 2.5 }},
      {click: 7.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 3   }},
      {click: 7.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 3.5 }},
      {click: 8.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1   }},
      {click: 8.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1.5 }},
      {click: 9.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 2   }},
    ]

    // ... setup
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 4:4 -> 3:4 on beat 2', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1   }},
      {click: 1.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2   }},
      {click: 2.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3   }},
      {click: 3.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4   }},
      {click: 4.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4.5 }},
      {click: 5.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1   }},
      {click: 5.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1.5 }},
      {click: 6.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 2   }},
      {click: 6.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 2.5 }},
      {click: 7.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 3   }},
      {click: 7.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 3.5 }},
      {click: 8.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1   }},
      {click: 8.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1.5 }},
      {click: 9.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 2   }},
    ]

    // ... setup
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 4:4 -> 3:4 on beat 3', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1   }},
      {click: 1.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2   }},
      {click: 2.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3   }},
      {click: 3.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4   }},
      {click: 4.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4.5 }},
      {click: 5.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1   }},
      {click: 5.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1.5 }},
      {click: 6.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2   }},
      {click: 6.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2.5 }},
      {click: 7.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 3   }},
      {click: 7.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 3.5 }},
      {click: 8.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1   }},
      {click: 8.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1.5 }},
      {click: 9.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 2   }},
    ]

    // ... setup
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 4:4 -> 3:4 on beat 4', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1   }},
      {click: 1.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2   }},
      {click: 2.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3   }},
      {click: 3.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4   }},
      {click: 4.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4.5 }},
      {click: 5.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1   }},
      {click: 5.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1.5 }},
      {click: 6.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2   }},
      {click: 6.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2.5 }},
      {click: 7.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3   }},
      {click: 7.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3.5 }},
      {click: 8.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1   }},
      {click: 8.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 1.5 }},
      {click: 9.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 3, beat: 2   }},
    ]

    // ... setup
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 3:4 -> 4:4 on beat 1', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 1   }},
      {click: 1.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 2   }},
      {click: 2.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 3   }},
      {click: 3.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4   }},
      {click: 4.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 1, beat: 4.5 }},
      {click: 5.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1   }},
      {click: 5.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 1.5 }},
      {click: 6.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2   }},
      {click: 6.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2.5 }},
      {click: 7.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3   }},
      {click: 7.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3.5 }},
      {click: 8.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 4   }},
      {click: 8.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 4.5 }},
      {click: 9.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 1   }},
    ]

    // ... setup
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 3:4 -> 4:4 on beat 2', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 1   }},
      {click: 1.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 2   }},
      {click: 2.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 3   }},
      {click: 3.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 1   }},
      {click: 4.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 1.5 }},
      {click: 5.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2   }},
      {click: 5.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 2.5 }},
      {click: 6.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3   }},
      {click: 6.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3.5 }},
      {click: 7.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 4   }},
      {click: 7.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 4.5 }},
      {click: 8.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 1   }},
      {click: 8.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 1.5 }},
      {click: 9.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 2   }},
      {click: 9.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 2.5 }},
    ]

    // ... setup
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })

  it('click 3:4 -> 4:4 on beat 3', function () {
    // prettier-ignore
    const tests = [
      {click: 1.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 1   }},
      {click: 1.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 1.5 }},
      {click: 2.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 2   }},
      {click: 2.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 2.5 }},
      {click: 3.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 3   }},
      {click: 3.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 1, beat: 3.5 }},
      {click: 4.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 1   }},
      {click: 4.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 1.5 }},
      {click: 5.0, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 2   }},
      {click: 5.5, timeSignature: { beats: 3, divisions: 4 }, expected: { measure: 2, beat: 2.5 }},
      {click: 6.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3   }},
      {click: 6.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 3.5 }},
      {click: 7.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 4   }},
      {click: 7.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 2, beat: 4.5 }},
      {click: 8.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 1   }},
      {click: 8.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 1.5 }},
      {click: 9.0, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 2   }},
      {click: 9.5, timeSignature: { beats: 4, divisions: 4 }, expected: { measure: 3, beat: 2.5 }},
    ]

    // ... setup
    const vm = new VM(FS, [])

    // ... run
    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature, QUARTER_NOTES)

      expect({ measure, beat }).to.deep.equal(expected)
    }
  })
})

describe('tests VM.exec', function () {
  it('exec::tick/tock/tack/sticks', function () {
    // prettier-ignore
    const tests = [
      { measure: 1, beat: 1,   expected: [OPCODES.TICK] },
      { measure: 1, beat: 1.5, expected: [] },
      { measure: 1, beat: 2,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2.5, expected: [] },
      { measure: 1, beat: 3,   expected: [] },
      { measure: 1, beat: 3.5, expected: [] },
      { measure: 1, beat: 4,   expected: [OPCODES.TACK] },
      { measure: 1, beat: 4.5, expected: [] },
      { measure: 2, beat: 1,   expected: [] },
      { measure: 2, beat: 1.5, expected: [] },
      { measure: 2, beat: 2,   expected: [OPCODES.STICKS] },
      { measure: 2, beat: 2.5, expected: [] },
      { measure: 2, beat: 3,   expected: [] },
      { measure: 2, beat: 3.5, expected: [] },
      { measure: 2, beat: 4,   expected: [] },
      { measure: 2, beat: 4.5, expected: [OPCODES.DING] },
    ]

    // ... setup
    const timeSignature = { beats: 4, divisions: 4 }
    const subdivisions = QUARTER_NOTES

    // prettier-ignore
    const script = [
      { at: { measure: 1, beat: 1   }, op: OPCODES.TICK },
      { at: { measure: 1, beat: 2   }, op: OPCODES.TOCK },
      { at: { measure: 1, beat: 4   }, op: OPCODES.TACK },
      { at: { measure: 2, beat: 2   }, op: OPCODES.STICKS },
      { at: { measure: 2, beat: 4.5 }, op: OPCODES.DING },
    ]

    const vm = new VM(FS, script)

    // ... run
    for (const test of tests) {
      const click = { measure: test.measure, beat: test.beat }

      expect(vm.exec(click, timeSignature, subdivisions)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, quarter notes', function () {
    // prettier-ignore
    const tests = [
      { measure: 1, beat: 1,   expected: [OPCODES.TICK] },
      { measure: 1, beat: 1.5, expected: []             },
      { measure: 1, beat: 2,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2.5, expected: []             },
      { measure: 1, beat: 3,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 3.5, expected: []             },
      { measure: 1, beat: 4,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 4.5, expected: []             },

      { measure: 2, beat: 1,   expected: [OPCODES.TICK] },
      { measure: 2, beat: 1.5, expected: []             },
      { measure: 2, beat: 2,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 2.5, expected: []             },
      { measure: 2, beat: 3,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 3.5, expected: []             },
      { measure: 2, beat: 4,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 4.5, expected: []             },
    ]

    // ... setup
    const timeSignature = { beats: 4, divisions: 4 }
    const subdivisions = QUARTER_NOTES

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ]

    const vm = new VM(FS, script)

    // ... run
    for (const test of tests) {
      const click = { measure: test.measure, beat: test.beat }

      expect(vm.exec(click, timeSignature, subdivisions)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, eighth-doublets', function () {
    // prettier-ignore
    const tests = [
      { measure: 1, beat: 1,   expected: [OPCODES.TICK] },
      { measure: 1, beat: 1.5, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2.5, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 3,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 3.5, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 4,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 4.5, expected: [OPCODES.TOCK] },

      { measure: 2, beat: 1,   expected: [OPCODES.TICK] },
      { measure: 2, beat: 1.5, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 2,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 2.5, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 3,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 3.5, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 4,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 4.5, expected: [OPCODES.TOCK] },
    ]

    // ... setup
    const timeSignature = { beats: 4, divisions: 4 }
    const subdivisions = EIGHTH_DOUBLETS

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ]

    const vm = new VM(FS, script)

    // ... run
    for (const test of tests) {
      const click = { measure: test.measure, beat: test.beat }

      expect(vm.exec(click, timeSignature, subdivisions)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, quarter notes -> eighth doublets', function () {
    // prettier-ignore
    const tests = [
      { measure: 1, beat: 1,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TICK] },
      { measure: 1, beat: 1.5, subdivisions: QUARTER_NOTES,   expected: [] },
      { measure: 1, beat: 2,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2.5, subdivisions: QUARTER_NOTES,   expected: [] },
      { measure: 1, beat: 3,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 3.5, subdivisions: QUARTER_NOTES,   expected: [] },
      { measure: 1, beat: 4,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 4.5, subdivisions: QUARTER_NOTES,   expected: [] },

      { measure: 2, beat: 1,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TICK] },
      { measure: 2, beat: 1.5, subdivisions: QUARTER_NOTES,   expected: [] },
      { measure: 2, beat: 2,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 2.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 3,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 3.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 4,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 4.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
    ]

    // ... setup
    const timeSignature = { beats: 4, divisions: 4 }

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1     }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*'   }, op: OPCODES.TOCK },
    ]

    const vm = new VM(FS, script)

    // ... run
    for (const test of tests) {
      const click = { measure: test.measure, beat: test.beat }
      const subdivisions = test.subdivisions

      expect(vm.exec(click, timeSignature, subdivisions)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, eighth doublets -> quarter notes', function () {
    // prettier-ignore
    const tests = [
      { measure: 1, beat: 1,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TICK] },
      { measure: 1, beat: 1.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 3,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 3.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 4,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 1, beat: 4.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },

      { measure: 2, beat: 1,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TICK] },
      { measure: 2, beat: 1.5, subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 2,   subdivisions: EIGHTH_DOUBLETS, expected: [OPCODES.TOCK] },
      { measure: 2, beat: 2.5, subdivisions: QUARTER_NOTES,   expected: [] },
      { measure: 2, beat: 3,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 3.5, subdivisions: QUARTER_NOTES,   expected: [] },
      { measure: 2, beat: 4,   subdivisions: QUARTER_NOTES,   expected: [OPCODES.TOCK] },
      { measure: 2, beat: 4.5, subdivisions: QUARTER_NOTES,   expected: [] },
    ]

    // ... setup
    const timeSignature = { beats: 4, divisions: 4 }

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1     }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*'   }, op: OPCODES.TOCK },
    ]

    const vm = new VM(FS, script)

    // ... run
    for (const test of tests) {
      const click = { measure: test.measure, beat: test.beat }
      const subdivisions = test.subdivisions

      expect(vm.exec(click, timeSignature, subdivisions)).to.deep.equal(test.expected)
    }
  })

  it('exec, stop', function () {
    // prettier-ignore
    const tests = [
      { measure: 1, beat: 1,   expected: [OPCODES.TICK] },
      { measure: 1, beat: 1.5, expected: []             },
      { measure: 1, beat: 2,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 2.5, expected: []             },
      { measure: 1, beat: 3,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 3.5, expected: []             },
      { measure: 1, beat: 4,   expected: [OPCODES.TOCK] },
      { measure: 1, beat: 4.5, expected: []             },

      { measure: 2, beat: 1,   expected: [OPCODES.STOP] },
      { measure: 2, beat: 1.5, expected: [] },
      { measure: 2, beat: 2,   expected: [] },
      { measure: 2, beat: 2.5, expected: [] },
      { measure: 2, beat: 3,   expected: [] },
      { measure: 2, beat: 3.5, expected: [] },
      { measure: 2, beat: 4,   expected: [] },
      { measure: 2, beat: 4.5, expected: [] },
    ]

    // ... setup
    const timeSignature = { beats: 4, divisions: 4 }
    const subdivisions = QUARTER_NOTES

    // prettier-ignore
    const script = [
      { at: { measure: 2,   beat: 1   }, op: OPCODES.STOP },
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ]

    const vm = new VM(FS, script)

    // ... run
    for (const test of tests) {
      const click = { measure: test.measure, beat: test.beat }

      expect(vm.exec(click, timeSignature, subdivisions)).to.deep.equal(test.expected)
    }
  })
})

describe('4:4 time', function () {
  it('4:4 time, quarter notes @120BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,     expected: { measure: 1, beat: 1,     ops: [OPCODES.TICK] }},
      { tick:   57, time:  165.4422, click: 1.333, expected: { measure: 1, beat: 1.333, ops: []             }},
      { tick:   86, time:  249.6145, click: 1.5,   expected: { measure: 1, beat: 1.5,   ops: []             }},
      { tick:  114, time:  330.8844, click: 1.667, expected: { measure: 1, beat: 1.667, ops: []             }},
      { tick:  172, time:  499.2290, click: 2,     expected: { measure: 1, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick:  258, time:  748.8435, click: 2.5,   expected: { measure: 1, beat: 2.5,   ops: []             }},
      { tick:  344, time:  998.4580, click: 3,     expected: { measure: 1, beat: 3,     ops: [OPCODES.TOCK] }},
      { tick:  430, time: 1248.0726, click: 3.5,   expected: { measure: 1, beat: 3.5,   ops: []             }},
      { tick:  516, time: 1497.6871, click: 4,     expected: { measure: 1, beat: 4,     ops: [OPCODES.TOCK] }},
      { tick:  602, time: 1747.3016, click: 4.5,   expected: { measure: 1, beat: 4.5,   ops: []             }},
      { tick:  689, time: 1999.8186, click: 5,     expected: { measure: 2, beat: 1,     ops: [OPCODES.TICK] }},
      { tick:  775, time: 2249.4331, click: 5.5,   expected: { measure: 2, beat: 1.5,   ops: []             }},
      { tick:  861, time: 2499.0476, click: 6,     expected: { measure: 2, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick:  947, time: 2748.6621, click: 6.5,   expected: { measure: 2, beat: 2.5,   ops: []             }},
      { tick: 1033, time: 2998.2766, click: 7,     expected: { measure: 2, beat: 3,     ops: [OPCODES.TOCK] }},
      { tick: 1119, time: 3247.8912, click: 7.5,   expected: { measure: 2, beat: 3.5,   ops: []             }},
      { tick: 1205, time: 3497.5057, click: 8,     expected: { measure: 2, beat: 4,     ops: [OPCODES.TOCK] }},
      { tick: 1291, time: 3747.1202, click: 8.5,   expected: { measure: 2, beat: 4.5,   ops: []             }},
      { tick: 1378, time: 3999.6372, click: 9,     expected: { measure: 3, beat: 1,     ops: [OPCODES.TICK] }},
    ]

    // prettier-ignore
    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 120, { beats: 4, divisions: 4 }, QUARTER_NOTES, tests)
  })

  it('4:4 time, eighth-doublets notes @120BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,     expected: { measure: 1, beat: 1,     ops: [OPCODES.TICK] }},
      { tick:   57, time:  165.4422, click: 1.333, expected: { measure: 1, beat: 1.333, ops: []             }},
      { tick:   86, time:  249.6145, click: 1.5,   expected: { measure: 1, beat: 1.5,   ops: [OPCODES.TOCK] }},
      { tick:  114, time:  330.8844, click: 1.667, expected: { measure: 1, beat: 1.667, ops: []             }},
      { tick:  172, time:  499.2290, click: 2,     expected: { measure: 1, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick:  258, time:  748.8435, click: 2.5,   expected: { measure: 1, beat: 2.5,   ops: [OPCODES.TOCK] }},
      { tick:  344, time:  998.4580, click: 3,     expected: { measure: 1, beat: 3,     ops: [OPCODES.TOCK] }},
      { tick:  430, time: 1248.0726, click: 3.5,   expected: { measure: 1, beat: 3.5,   ops: [OPCODES.TOCK] }},
      { tick:  516, time: 1497.6871, click: 4,     expected: { measure: 1, beat: 4,     ops: [OPCODES.TOCK] }},
      { tick:  602, time: 1747.3016, click: 4.5,   expected: { measure: 1, beat: 4.5,   ops: [OPCODES.TOCK] }},
      { tick:  689, time: 1999.8186, click: 5,     expected: { measure: 2, beat: 1,     ops: [OPCODES.TICK] }},
      { tick:  775, time: 2249.4331, click: 5.5,   expected: { measure: 2, beat: 1.5,   ops: [OPCODES.TOCK] }},
      { tick:  861, time: 2499.0476, click: 6,     expected: { measure: 2, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick:  947, time: 2748.6621, click: 6.5,   expected: { measure: 2, beat: 2.5,   ops: [OPCODES.TOCK] }},
      { tick: 1033, time: 2998.2766, click: 7,     expected: { measure: 2, beat: 3,     ops: [OPCODES.TOCK] }},
      { tick: 1119, time: 3247.8912, click: 7.5,   expected: { measure: 2, beat: 3.5,   ops: [OPCODES.TOCK] }},
      { tick: 1205, time: 3497.5057, click: 8,     expected: { measure: 2, beat: 4,     ops: [OPCODES.TOCK] }},
      { tick: 1291, time: 3747.1202, click: 8.5,   expected: { measure: 2, beat: 4.5,   ops: [OPCODES.TOCK] }},
      { tick: 1378, time: 3999.6372, click: 9,     expected: { measure: 3, beat: 1,     ops: [OPCODES.TICK] }},
    ]

    // prettier-ignore
    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 120, { beats: 4, divisions: 4 }, EIGHTH_DOUBLETS, tests)
  })
})

describe('2:2 time', function () {
  it('2:2 time, half notes @120BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,    expected: { measure: 1, beat: 1,   ops: [OPCODES.TICK] }},
      { tick:   86, time:  249.6145, click: 1.5,  expected: { measure: 1, beat: 1.5, ops: []             }},
      { tick:  172, time:  499.2290, click: 2,    expected: { measure: 1, beat: 2,   ops: [OPCODES.TOCK] }},
      { tick:  258, time:  748.8435, click: 2.5,  expected: { measure: 1, beat: 2.5, ops: []             }},
      { tick:  344, time:  998.4580, click: 3,    expected: { measure: 2, beat: 1,   ops: [OPCODES.TICK] }},
      { tick:  430, time: 1248.0726, click: 3.5,  expected: { measure: 2, beat: 1.5, ops: []             }},
      { tick:  516, time: 1497.6871, click: 4,    expected: { measure: 2, beat: 2,   ops: [OPCODES.TOCK] }},
      { tick:  602, time: 1747.3016, click: 4.5,  expected: { measure: 2, beat: 2.5, ops: []             }},
      { tick:  689, time: 1999.8186, click: 5,    expected: { measure: 3, beat: 1,   ops: [OPCODES.TICK] }},
      { tick:  775, time: 2249.4331, click: 5.5,  expected: { measure: 3, beat: 1.5, ops: []             }},
      { tick:  861, time: 2499.0476, click: 6,    expected: { measure: 3, beat: 2,   ops: [OPCODES.TOCK] }},
      { tick:  947, time: 2748.6621, click: 6.5,  expected: { measure: 3, beat: 2.5, ops: []             }},
      { tick: 1033, time: 2998.2766, click: 7,    expected: { measure: 4, beat: 1,   ops: [OPCODES.TICK] }},
      { tick: 1119, time: 3247.8912, click: 7.5,  expected: { measure: 4, beat: 1.5, ops: []             }},
      { tick: 1205, time: 3497.5057, click: 8,    expected: { measure: 4, beat: 2,   ops: [OPCODES.TOCK] }},
      { tick: 1291, time: 3747.1202, click: 8.5,  expected: { measure: 4, beat: 2.5, ops: []             }},
      { tick: 1378, time: 3999.6372, click: 9,    expected: { measure: 5, beat: 1,   ops: [OPCODES.TICK] }},
    ]

    // prettier-ignore
    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 120, { beats: 2, divisions: 2 }, HALF_NOTES, tests)
  })

  it('2:2 time, quarter notes @120BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,    expected: { measure: 1, beat: 1,    ops: [OPCODES.TICK] }},
      { tick:   86, time:  249.6145, click: 1.5,  expected: { measure: 1, beat: 1.25, ops: []             }},
      { tick:  172, time:  499.2290, click: 2,    expected: { measure: 1, beat: 1.5,  ops: [OPCODES.TOCK] }},
      { tick:  258, time:  748.8435, click: 2.5,  expected: { measure: 1, beat: 1.75, ops: []             }},
      { tick:  344, time:  998.4580, click: 3,    expected: { measure: 1, beat: 2,    ops: [OPCODES.TOCK] }},
      { tick:  430, time: 1248.0726, click: 3.5,  expected: { measure: 1, beat: 2.25, ops: []             }},
      { tick:  516, time: 1497.6871, click: 4,    expected: { measure: 1, beat: 2.5,  ops: [OPCODES.TOCK] }},
      { tick:  602, time: 1747.3016, click: 4.5,  expected: { measure: 1, beat: 2.75, ops: []             }},
      { tick:  689, time: 1999.8186, click: 5,    expected: { measure: 2, beat: 1,    ops: [OPCODES.TICK] }},
      { tick:  775, time: 2249.4331, click: 5.5,  expected: { measure: 2, beat: 1.25, ops: []             }},
      { tick:  861, time: 2499.0476, click: 6,    expected: { measure: 2, beat: 1.5,  ops: [OPCODES.TOCK] }},
      { tick:  947, time: 2748.6621, click: 6.5,  expected: { measure: 2, beat: 1.75, ops: []             }},
      { tick: 1033, time: 2998.2766, click: 7,    expected: { measure: 2, beat: 2,    ops: [OPCODES.TOCK] }},
      { tick: 1119, time: 3247.8912, click: 7.5,  expected: { measure: 2, beat: 2.25, ops: []             }},
      { tick: 1205, time: 3497.5057, click: 8,    expected: { measure: 2, beat: 2.5,  ops: [OPCODES.TOCK] }},
      { tick: 1291, time: 3747.1202, click: 8.5,  expected: { measure: 2, beat: 2.75, ops: []             }},
      { tick: 1378, time: 3999.6372, click: 9,    expected: { measure: 3, beat: 1,    ops: [OPCODES.TICK] }},
    ]

    // prettier-ignore
    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 120, { beats: 2, divisions: 2 }, QUARTER_NOTES, tests)
  })
})

describe('tests VM.click with 6:8 time', function () {
  it('6:8 time, eighth notes @120BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,    expected: { measure: 1, beat: 1,   ops: [OPCODES.TICK] }},
      { tick:   86, time:  249.6145, click: 1.5,  expected: { measure: 1, beat: 1.5, ops: []             }},
      { tick:  172, time:  499.2290, click: 2,    expected: { measure: 1, beat: 2,   ops: [OPCODES.TOCK] }},
      { tick:  258, time:  748.8435, click: 2.5,  expected: { measure: 1, beat: 2.5, ops: []             }},
      { tick:  344, time:  998.4580, click: 3,    expected: { measure: 1, beat: 3,   ops: [OPCODES.TOCK] }},
      { tick:  430, time: 1248.0726, click: 3.5,  expected: { measure: 1, beat: 3.5, ops: []             }},
      { tick:  516, time: 1497.6871, click: 4,    expected: { measure: 1, beat: 4,   ops: [OPCODES.TOCK] }},
      { tick:  602, time: 1747.3016, click: 4.5,  expected: { measure: 1, beat: 4.5, ops: []             }},
      { tick:  689, time: 1999.8186, click: 5,    expected: { measure: 1, beat: 5,   ops: [OPCODES.TOCK] }},
      { tick:  775, time: 2249.4331, click: 5.5,  expected: { measure: 1, beat: 5.5, ops: []             }},
      { tick:  861, time: 2499.0476, click: 6,    expected: { measure: 1, beat: 6,   ops: [OPCODES.TOCK] }},
      { tick:  947, time: 2748.6621, click: 6.5,  expected: { measure: 1, beat: 6.5, ops: []             }},
      { tick: 1033, time: 2998.2766, click: 7,    expected: { measure: 2, beat: 1,   ops: [OPCODES.TICK] }},
      { tick: 1119, time: 3247.8912, click: 7.5,  expected: { measure: 2, beat: 1.5, ops: []             }},
      { tick: 1205, time: 3497.5057, click: 8,    expected: { measure: 2, beat: 2,   ops: [OPCODES.TOCK] }},
      { tick: 1291, time: 3747.1202, click: 8.5,  expected: { measure: 2, beat: 2.5, ops: []             }},
      { tick: 1378, time: 3999.6372, click: 9,    expected: { measure: 2, beat: 3,   ops: [OPCODES.TOCK] }},
      { tick: 1464, time: 4249.2517, click: 9.5,  expected: { measure: 2, beat: 3.5, ops: []             }},
      { tick: 1550, time: 4498.8662, click: 10,   expected: { measure: 2, beat: 4,   ops: [OPCODES.TOCK] }},
      { tick: 1636, time: 4748.4807, click: 10.5, expected: { measure: 2, beat: 4.5, ops: []             }},
      { tick: 1722, time: 4998.0952, click: 11,   expected: { measure: 2, beat: 5,   ops: [OPCODES.TOCK] }},
      { tick: 1808, time: 5247.7098, click: 11.5, expected: { measure: 2, beat: 5.5, ops: []             }},
      { tick: 1894, time: 5497.3243, click: 12,   expected: { measure: 2, beat: 6,   ops: [OPCODES.TOCK] }},
      { tick: 1981, time: 5749.8413, click: 12.5, expected: { measure: 2, beat: 6.5, ops: []             }},
      { tick: 2067, time: 5999.4558, click: 13,   expected: { measure: 3, beat: 1,   ops: [OPCODES.TICK] }},
    ]

    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1 }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 120, { beats: 6, divisions: 8 }, EIGHTH_NOTES, tests)
  })

  it('6:8 time, eighth doublets @120BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,    expected: { measure: 1, beat: 1, ops: [OPCODES.TICK] }},
      { tick:   86, time:  249.6145, click: 1.5,  expected: { measure: 1, beat: 2, ops: [OPCODES.TOCK] }},
      { tick:  172, time:  499.2290, click: 2,    expected: { measure: 1, beat: 3, ops: [OPCODES.TOCK] }},
      { tick:  258, time:  748.8435, click: 2.5,  expected: { measure: 1, beat: 4, ops: [OPCODES.TOCK] }},
      { tick:  344, time:  998.4580, click: 3,    expected: { measure: 1, beat: 5, ops: [OPCODES.TOCK] }},
      { tick:  430, time: 1248.0726, click: 3.5,  expected: { measure: 1, beat: 6, ops: [OPCODES.TOCK] }},
      { tick:  516, time: 1497.6871, click: 4,    expected: { measure: 2, beat: 1, ops: [OPCODES.TICK] }},
      { tick:  602, time: 1747.3016, click: 4.5,  expected: { measure: 2, beat: 2, ops: [OPCODES.TOCK] }},
      { tick:  689, time: 1999.8186, click: 5,    expected: { measure: 2, beat: 3, ops: [OPCODES.TOCK] }},
      { tick:  775, time: 2249.4331, click: 5.5,  expected: { measure: 2, beat: 4, ops: [OPCODES.TOCK] }},
      { tick:  861, time: 2499.0476, click: 6,    expected: { measure: 2, beat: 5, ops: [OPCODES.TOCK] }},
      { tick:  947, time: 2748.6621, click: 6.5,  expected: { measure: 2, beat: 6, ops: [OPCODES.TOCK] }},
      { tick: 1033, time: 2998.2766, click: 7,    expected: { measure: 3, beat: 1, ops: [OPCODES.TICK] }},
      { tick: 1119, time: 3247.8912, click: 7.5,  expected: { measure: 3, beat: 2, ops: [OPCODES.TOCK] }},
      { tick: 1205, time: 3497.5057, click: 8,    expected: { measure: 3, beat: 3, ops: [OPCODES.TOCK] }},
      { tick: 1291, time: 3747.1202, click: 8.5,  expected: { measure: 3, beat: 4, ops: [OPCODES.TOCK] }},
      { tick: 1378, time: 3999.6372, click: 9,    expected: { measure: 3, beat: 5, ops: [OPCODES.TOCK] }},
      { tick: 1464, time: 4249.2517, click: 9.5,  expected: { measure: 3, beat: 6, ops: [OPCODES.TOCK] }},
      { tick: 1550, time: 4498.8662, click: 10,   expected: { measure: 4, beat: 1, ops: [OPCODES.TICK] }},
    ]

    // prettier-ignore
    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 120, { beats: 6, divisions: 8 }, EIGHTH_DOUBLETS, tests)
  })

  it('6:8 time, eighth triplets @40BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,     expected: { measure: 1, beat: 1,     ops: [OPCODES.TICK] }},
      { tick:  172, time:  499.2290, click: 1.333, expected: { measure: 1, beat: 1.333, ops: [OPCODES.TOCK] }},
      { tick:  258, time:  748.8435, click: 1.5,   expected: { measure: 1, beat: 1.5,   ops: []             }},
      { tick:  344, time:  998.4580, click: 1.667, expected: { measure: 1, beat: 1.667, ops: [OPCODES.TOCK] }},
      { tick:  516, time: 1497.6871, click: 2,     expected: { measure: 1, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick:  689, time: 1999.8186, click: 2.333, expected: { measure: 1, beat: 2.333, ops: [OPCODES.TOCK] }},
      { tick:  775, time: 2249.4331, click: 2.5,   expected: { measure: 1, beat: 2.5,   ops: []             }},
      { tick:  861, time: 2499.0476, click: 2.667, expected: { measure: 1, beat: 2.667, ops: [OPCODES.TOCK] }},
      { tick: 1033, time: 2998.2766, click: 3,     expected: { measure: 2, beat: 1,     ops: [OPCODES.TICK] }},
      { tick: 1205, time: 3497.5057, click: 3.333, expected: { measure: 2, beat: 1.333, ops: [OPCODES.TOCK] }},
      { tick: 1291, time: 3747.1202, click: 3.5,   expected: { measure: 2, beat: 1.5,   ops: []             }},
      { tick: 1378, time: 3999.6372, click: 3.667, expected: { measure: 2, beat: 1.667, ops: [OPCODES.TOCK] }},
      { tick: 1550, time: 4498.8662, click: 4,     expected: { measure: 2, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick: 1722, time: 4998.0952, click: 4.333, expected: { measure: 2, beat: 2.333, ops: [OPCODES.TOCK] }},
      { tick: 1808, time: 5247.7098, click: 4.5,   expected: { measure: 2, beat: 2.5,   ops: []             }},
      { tick: 1894, time: 5497.3243, click: 4.667, expected: { measure: 2, beat: 2.667, ops: [OPCODES.TOCK] }},
      { tick: 2067, time: 5999.4558, click: 5,     expected: { measure: 3, beat: 1,     ops: [OPCODES.TICK] }},
    ]

    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1 }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 40, { beats: 6, divisions: 8 }, EIGHTH_TRIPLETS, tests)
  })

  it('6:8 time, dotted quarter @40BPM', function () {
    // prettier-ignore
    const tests = [
      { tick:    0, time:    0.0000, click: 1,     expected: { measure: 1, beat: 1,     ops: [OPCODES.TICK] }},
      { tick:  172, time:  499.2290, click: 1.333, expected: { measure: 1, beat: 1.333, ops: []             }},
      { tick:  258, time:  748.8435, click: 1.5,   expected: { measure: 1, beat: 1.5,   ops: []             }},
      { tick:  344, time:  998.4580, click: 1.667, expected: { measure: 1, beat: 1.667, ops: []             }},
      { tick:  516, time: 1497.6871, click: 2,     expected: { measure: 1, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick:  689, time: 1999.8186, click: 2.333, expected: { measure: 1, beat: 2.333, ops: []             }},
      { tick:  775, time: 2249.4331, click: 2.5,   expected: { measure: 1, beat: 2.5,   ops: []             }},
      { tick:  861, time: 2499.0476, click: 2.667, expected: { measure: 1, beat: 2.667, ops: []             }},
      { tick: 1033, time: 2998.2766, click: 3,     expected: { measure: 2, beat: 1,     ops: [OPCODES.TICK] }},
      { tick: 1205, time: 3497.5057, click: 3.333, expected: { measure: 2, beat: 1.333, ops: []             }},
      { tick: 1291, time: 3747.1202, click: 3.5,   expected: { measure: 2, beat: 1.5,   ops: []             }},
      { tick: 1378, time: 3999.6372, click: 3.667, expected: { measure: 2, beat: 1.667, ops: []             }},
      { tick: 1550, time: 4498.8662, click: 4,     expected: { measure: 2, beat: 2,     ops: [OPCODES.TOCK] }},
      { tick: 1722, time: 4998.0952, click: 4.333, expected: { measure: 2, beat: 2.333, ops: []             }},
      { tick: 1808, time: 5247.7098, click: 4.5,   expected: { measure: 2, beat: 2.5,   ops: []             }},
      { tick: 1894, time: 5497.3243, click: 4.667, expected: { measure: 2, beat: 2.667, ops: []             }},
      { tick: 2067, time: 5999.4558, click: 5,     expected: { measure: 3, beat: 1,     ops: [OPCODES.TICK] }},
    ]

    const vm = new VM(FS, [
      { at: { measure: '*', beat: 1 }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ])

    run(vm, 40, { beats: 6, divisions: 8 }, DOTTED_QUARTER_NOTES, tests)
  })
})

function run(vm, bpm, timeSignature, subdivisions, tests) {
  let tick = 0
  for (const test of tests) {
    while (tick < test.tick) {
      vm.tick(bpm, BUFFERSIZE)
      tick++
    }

    const { time, click } = vm.tick(bpm, BUFFERSIZE)
    const { measure, beat } = vm.click(click, timeSignature, subdivisions)
    const ops = vm.exec({ measure, beat }, timeSignature, subdivisions)

    tick++

    expect(time * 1000).to.be.approximately(test.time, 0.0001)
    expect(click).to.equal(test.click)
    expect({ measure, beat, ops }).to.deep.equal(test.expected)
  }
}

