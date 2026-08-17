import { describe, it } from 'mocha'
import { expect } from 'chai'
import { VM } from '../../html/javascript/audio/vm/vm.js'
import { OPCODES, SUBDIVISIONS } from '../../html/javascript/audio/vm/constants.js'
import { QUARTER_NOTES, EIGHTH_DOUBLETS } from '../../html/javascript/audio/vm/constants.js'

describe('tests VM.tick', function () {
  it('tick fs:44100, buffer:128, delay:0', function () {
    const BPM = 120
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

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
    const BPM = 120
    const fs = 48000
    const bufferSize = 128
    const vm = new VM(fs, [])

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
    const BPM = 120
    const fs = 48000
    const bufferSize = 64
    const vm = new VM(fs, [])

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
    const BPM = 120
    const fs = 48000
    const bufferSize = 256
    const vm = new VM(fs, [])

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
    const BPM = 40
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      { tick: 0,    time:    0.0000, click: 1 },
      { tick: 1,    time:    2.9025 },

      { tick: 257,  time: 745.9410 },
      { tick: 258,  time: 748.8435, click: 1.5 },
      { tick: 258,  time: 751.7460 },

      { tick: 515,  time: 1494.7846 },
      { tick: 516,  time: 1497.6871, click: 2  },
      { tick: 517,  time: 1500.5896 },

      { tick: 774,  time: 2246.5306 },
      { tick: 775,  time: 2249.4331, click: 2.5 },
      { tick: 776,  time: 2252.3356 },

      { tick: 1032, time: 2995.3741 },
      { tick: 1033, time: 2998.2766, click: 3 },
      { tick: 1034, time: 3001.1791 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM, bufferSize)
        tick++
      }

      const { time, click } = vm.tick(BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })

  it('click 120BPM', function () {
    const BPM = 120
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      { tick: 0,   time:    0.0000, click: 1 },
      { tick: 1,   time:    2.9025 },

      { tick: 85, time:   246.7120 },
      { tick: 86, time:   249.6145, click: 1.5 },
      { tick: 87, time:   252.5170 },

      { tick: 171, time:  496.3265 },
      { tick: 172, time:  499.2290, click: 2  },
      { tick: 173, time:  502.1315 },

      { tick: 257, time:  745.9410 },
      { tick: 258, time:  748.8435, click: 2.5  },
      { tick: 259, time:  751.7460 },

      { tick: 343, time:  995.5556 },
      { tick: 344, time:  998.4580, click: 3 },
      { tick: 345, time: 1001.3605 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM, bufferSize)
        tick++
      }

      const { time, click } = vm.tick(BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })

  it('click 200BPM', function () {
    const BPM = 200
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      { tick: 0,   time:   0.0000, click: 1 },
      { tick: 1,   time:   2.9025 },

      { tick: 50,  time: 145.1247 },
      { tick: 51,  time: 148.0272, click: 1.5  },
      { tick: 52,  time: 150.9297 },

      { tick: 102, time: 296.0544 },
      { tick: 103, time: 298.9569, click: 2  },
      { tick: 104, time: 301.8594 },

      { tick: 154, time: 446.9841 },
      { tick: 155, time: 449.8866, click: 2.5  },
      { tick: 156, time: 452.7891 },

      { tick: 205, time: 595.0113 },
      { tick: 206, time: 597.9138, click: 3 },
      { tick: 207, time: 600.8163 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM, bufferSize)
        tick++
      }

      const { time, click } = vm.tick(BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })

  it('click 120BPM -> 40BPM, on the beat', function () {
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      { tick:    0, BPM: 120, time:    0.0000, click: 1 },
      { tick:    1, BPM: 120, time:    2.9025 },

      { tick:   85, BPM: 120, time:   246.7120 },
      { tick:   86, BPM: 120, time:   249.6145, click: 1.5 },
      { tick:   87, BPM: 120, time:   252.5170 },

      { tick:  171, BPM: 120, time:  496.3265 },
      { tick:  172, BPM: 120, time:  499.2290, click: 2  },
      { tick:  173, BPM: 120, time:  502.1315 },

      { tick:  257, BPM: 120, time:  745.9410 },
      { tick:  258, BPM: 120, time:  748.8435, click: 2.5  },
      { tick:  259, BPM: 120, time:  751.7460 },

      { tick:  343, BPM: 120, time:  995.5556 },
      { tick:  344, BPM:  40, time:  998.4580 },
      { tick:  345, BPM:  40, time: 1001.3605 },

      { tick:  688, BPM:  40, time: 1996.9161 },
      { tick:  689, BPM:  40, time: 1999.8186, click: 3 },
      { tick:  690, BPM:  40, time: 2002.7211 },

      { tick:  946, BPM:  40, time: 2745.7596 },
      { tick:  947, BPM:  40, time: 2748.6621, click: 3.5 },
      { tick:  946, BPM:  40, time: 2751.5646 },

      { tick: 1204, BPM:  40, time: 3494.6032 },
      { tick: 1205, BPM:  40, time: 3497.5057, click: 4 },
      { tick: 1206, BPM:  40, time: 3500.4082 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(test.BPM, bufferSize)
        tick++
      }

      const { time, click } = vm.tick(test.BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })

  it('click 120BPM -> 40BPM, on the half-beat', function () {
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      { tick:    0, BPM: 120, time:    0.0000, click: 1 },
      { tick:    1, BPM: 120, time:    2.9025 },

      { tick:   85, BPM: 120, time:   246.7120 },
      { tick:   86, BPM: 120, time:   249.6145, click: 1.5 },
      { tick:   87, BPM: 120, time:   252.5170 },

      { tick:  171, BPM: 120, time:  496.3265 },
      { tick:  172, BPM: 120, time:  499.2290, click: 2  },
      { tick:  173, BPM: 120, time:  502.1315 },

      { tick:  257, BPM: 120, time:  745.9410 },
      { tick:  258, BPM:  40, time:  748.8435 },
      { tick:  259, BPM:  40, time:  751.7460 },

      { tick:  429, BPM:  40, time: 1245.1701 },
      { tick:  430, BPM:  40, time: 1248.0726, click: 2.5 },
      { tick:  431, BPM:  40, time: 1250.9751 },

      { tick:  688, BPM:  40, time: 1996.9161 },
      { tick:  689, BPM:  40, time: 1999.8186, click: 3 },
      { tick:  690, BPM:  40, time: 2002.7211 },

      { tick:  946, BPM:  40, time: 2745.7596 },
      { tick:  947, BPM:  40, time: 2748.6621, click: 3.5 },
      { tick:  946, BPM:  40, time: 2751.5646 },

      { tick: 1204, BPM:  40, time: 3494.6032 },
      { tick: 1205, BPM:  40, time: 3497.5057, click: 4 },
      { tick: 1206, BPM:  40, time: 3500.4082 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(test.BPM, bufferSize)
        tick++
      }

      const { time, click } = vm.tick(test.BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })

  it('click 120BPM -> 200BPM, on the beat', function () {
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      { tick:   0, BPM: 120, time:    0.0000, click: 1 },
      { tick:   1, BPM: 120, time:    2.9025 },

      { tick:  85, BPM: 120, time:   246.7120 },
      { tick:  86, BPM: 120, time:   249.6145, click: 1.5 },
      { tick:  87, BPM: 120, time:   252.5170 },

      { tick: 171, BPM: 120, time:  496.3265 },
      { tick: 172, BPM: 120, time:  499.2290, click: 2  },
      { tick: 173, BPM: 120, time:  502.1315 },

      { tick: 257, BPM: 120, time:  745.9410 },
      { tick: 258, BPM: 120, time:  748.8435, click: 2.5  },
      { tick: 259, BPM: 120, time:  751.7460 },

      { tick: 343, BPM: 120, time:  995.5556 },
      { tick: 344, BPM: 200, time:  998.4580 },
      { tick: 345, BPM: 200, time: 1001.3605 },

      { tick: 377, BPM: 200, time: 1094.2404 },
      { tick: 378, BPM: 200, time: 1097.1429, click: 3 },
      { tick: 379, BPM: 200, time: 1100.0454 },

      { tick: 429, BPM: 200, time: 1245.1701 },
      { tick: 430, BPM: 200, time: 1248.0726, click: 3.5 },
      { tick: 431, BPM: 200, time: 1250.9751 },

      { tick: 481, BPM: 200, time: 1396.0998 },
      { tick: 482, BPM: 200, time: 1399.0023, click: 4 },
      { tick: 483, BPM: 200, time: 1401.9048 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(test.BPM, bufferSize)
        tick++
      }

      const { time, click } = vm.tick(test.BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })

  it('click 120BPM -> 200BPM, on the half-beat', function () {
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      { tick:   0, BPM: 120, time:    0.0000, click: 1 },
      { tick:   1, BPM: 120, time:    2.9025 },

      { tick:  85, BPM: 120, time:   246.7120 },
      { tick:  86, BPM: 120, time:   249.6145, click: 1.5 },
      { tick:  87, BPM: 120, time:   252.5170 },

      { tick: 171, BPM: 120, time:  496.3265 },
      { tick: 172, BPM: 120, time:  499.2290, click: 2  },
      { tick: 173, BPM: 120, time:  502.1315 },

      { tick: 222, BPM: 120, time:  644.3537 },
      { tick: 223, BPM: 200, time:  647.2562, click: 2.5  },
      { tick: 224, BPM: 200, time:  650.1587 },

      { tick: 274, BPM: 200, time: 795.2834},
      { tick: 275, BPM: 200, time: 798.1859, click: 3 },
      { tick: 276, BPM: 200, time: 801.0884 },

      { tick: 326, BPM: 200, time: 946.2132 },
      { tick: 327, BPM: 200, time: 949.1156, click: 3.5 },
      { tick: 328, BPM: 200, time: 952.0181 },

      { tick: 377, BPM: 200, time: 1094.2404 },
      { tick: 378, BPM: 200, time: 1097.1429, click: 4 },
      { tick: 379, BPM: 200, time: 1100.0454 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(test.BPM, bufferSize)
        tick++
      }

      const { time, click } = vm.tick(test.BPM, bufferSize)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })
})

describe('tests VM.click, quarter notes', function () {
  it('click 2:2, quarter notes', function () {
    const timeSignature = { beats: 2, divisions: 2 }
    const fs = 44100
    const vm = new VM(fs, [])

    // prettier-ignore
    const tests = [
      {click: 1.0, expected: { measure: 1, beat: 1}},
      {click: 1.5, expected: { measure: 1, beat: 1.5}},
      {click: 2.0, expected: { measure: 1, beat: 2}},
      {click: 2.5, expected: { measure: 1, beat: 2.5}},
      {click: 3.0, expected: { measure: 2, beat: 1}},
      {click: 3.5, expected: { measure: 2, beat: 1.5}},
      {click: 4.0, expected: { measure: 2, beat: 2}},
      {click: 4.5, expected: { measure: 2, beat: 2.5}},
      {click: 5.0, expected: { measure: 3, beat: 1}},
      {click: 5.5, expected: { measure: 3, beat: 1.5}},
      {click: 6.0, expected: { measure: 3, beat: 2}},
      {click: 6.5, expected: { measure: 3, beat: 2.5}},
      {click: 7.0, expected: { measure: 4, beat: 1}},
      {click: 7.5, expected: { measure: 4, beat: 1.5}},
      {click: 8.0, expected: { measure: 4, beat: 2}},
      {click: 8.5, expected: { measure: 4, beat: 2.5}},
      {click: 9.0, expected: { measure: 5, beat: 1}},
    ]

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 2:4, quarter notes', function () {
    const timeSignature = { beats: 2, divisions: 4 }
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 3:4, quarter notes', function () {
    const timeSignature = { beats: 3, divisions: 4 }
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 4:4, quarter notes', function () {
    const timeSignature = { beats: 4, divisions: 4 }
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 4:4 -> 3:4 on beat 1, quarter notes', function () {
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 4:4 -> 3:4 on beat 2, quarter notes', function () {
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 4:4 -> 3:4 on beat 3, quarter notes', function () {
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 4:4 -> 3:4 on beat 4, quarter notes', function () {
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 3:4 -> 4:4 on beat 1, quarter notes', function () {
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 3:4 -> 4:4 on beat 2, quarter notes', function () {
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })

  it('click 3:4 -> 4:4 on beat 3, quarter notes', function () {
    const fs = 44100
    const vm = new VM(fs, [])

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

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, test.timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })
})

describe('tests VM.click with subdivisions', function () {
  it('click 4:4, eighth note doublets', function () {
    const timeSignature = { beats: 4, divisions: 4 }
    const subdivisions = SUBDIVISIONS.EIGHTH_DOUBLETS
    const fs = 44100
    const vm = new VM(fs, [])

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
      {click: 9.5, expected: { measure: 3, beat: 1.5 }},
    ]

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature, subdivisions)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })
})

describe('tests VM.exec', function () {
  it('exec::tick/tock/tack/sticks', function () {
    const fs = 44100

    // prettier-ignore
    const script = [
      { at: { measure: 1, beat: 1   }, op: OPCODES.TICK },
      { at: { measure: 1, beat: 2   }, op: OPCODES.TOCK },
      { at: { measure: 1, beat: 4   }, op: OPCODES.TACK },
      { at: { measure: 2, beat: 2   }, op: OPCODES.STICKS },
      { at: { measure: 2, beat: 4.5 }, op: OPCODES.DING },
    ]

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

    const vm = new VM(fs, script)

    for (const test of tests) {
      expect(vm.exec({ measure: test.measure, beat: test.beat }, QUARTER_NOTES)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, quarter notes', function () {
    const fs = 44100

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ]

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

    const vm = new VM(fs, script)
    for (const test of tests) {
      expect(vm.exec({ measure: test.measure, beat: test.beat }, QUARTER_NOTES)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, eighth-doublets', function () {
    const fs = 44100

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
    ]

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

    const vm = new VM(fs, script)
    for (const test of tests) {
      expect(vm.exec({ measure: test.measure, beat: test.beat }, EIGHTH_DOUBLETS)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, quarter notes -> eighth doublets', function () {
    const fs = 44100

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1     }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*'   }, op: OPCODES.TOCK },
    ]

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

    const vm = new VM(fs, script)
    for (const test of tests) {
      expect(vm.exec({ measure: test.measure, beat: test.beat }, test.subdivisions)).to.deep.equal(test.expected)
    }
  })

  it('exec, measure:*, beat:*, eighth doublets -> quarter notes', function () {
    const fs = 44100

    // prettier-ignore
    const script = [
      { at: { measure: '*', beat: 1     }, op: OPCODES.TICK },
      { at: { measure: '*', beat: '*'   }, op: OPCODES.TOCK },
    ]

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

    const vm = new VM(fs, script)
    for (const test of tests) {
      expect(vm.exec({ measure: test.measure, beat: test.beat }, test.subdivisions)).to.deep.equal(test.expected)
    }
  })
})
