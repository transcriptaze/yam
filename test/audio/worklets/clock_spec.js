import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Clock } from '../../../html/javascript/audio/worklets/clock.js'
import { EIGHTH, EIGHTH_DOUBLET, QUARTER, DOTTED_QUARTER } from '../../../html/javascript/audio/shared/constants.js'

describe('tests clock (internal) interval function', function () {
  it('4:4, quarter notes', function () {
    const tests = [
      { BPM: 40, figura: 4, pulse: QUARTER, expected: { interval: 1500, subinterval: 1500, clicksPerBeat: 1 } },
      { BPM: 60, figura: 4, pulse: QUARTER, expected: { interval: 1000, subinterval: 1000, clicksPerBeat: 1 } },
      { BPM: 120, figura: 4, pulse: QUARTER, expected: { interval: 500, subinterval: 500, clicksPerBeat: 1 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const { interval, subinterval, clicksPerBeat } = clock.interval(t.BPM, t.figura, t.pulse)

      expect(interval).to.equal(t.expected.interval)
      expect(subinterval).to.equal(t.expected.subinterval)
      expect(clicksPerBeat).to.equal(t.expected.clicksPerBeat)
    }
  })

  it('4:4, eighth note doublets notes', function () {
    const tests = [
      { BPM: 40, figura: 4, pulse: EIGHTH, expected: { interval: 1500, subinterval: 750, clicksPerBeat: 2 } },
      { BPM: 60, figura: 4, pulse: EIGHTH, expected: { interval: 1000, subinterval: 500, clicksPerBeat: 2 } },
      { BPM: 120, figura: 4, pulse: EIGHTH, expected: { interval: 500, subinterval: 250, clicksPerBeat: 2 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const { interval, subinterval, clicksPerBeat } = clock.interval(t.BPM, t.figura, t.pulse)

      expect(interval).to.equal(t.expected.interval)
      expect(subinterval).to.equal(t.expected.subinterval)
      expect(clicksPerBeat).to.equal(t.expected.clicksPerBeat)
    }
  })

  it('6:8, dotted-quarter notes', function () {
    const tests = [{ BPM: 60, figura: 8, pulse: DOTTED_QUARTER, expected: { interval: 333.333, subinterval: 333.333, clicksPerBeat: 1 } }]

    const clock = new Clock()

    for (const t of tests) {
      const { interval, subinterval, clicksPerBeat } = clock.interval(t.BPM, t.figura, t.pulse)

      expect(interval).to.be.closeTo(t.expected.interval, 0.001)
      expect(subinterval).to.be.closeTo(t.expected.subinterval, 0.001)
      expect(clicksPerBeat).to.equal(t.expected.clicksPerBeat)
    }
  })
})

describe('tests clock tick()', function () {
  it('default clock tick @44.1kHz', function () {
    const tests = [
      { expected: 0.0 },
      { expected: 2.902 },
      { expected: 5.805 },
      { expected: 8.707 },
      { expected: 11.61 },
      { expected: 14.512 },
      { expected: 17.415 },
    ]

    const clock = new Clock()

    for (const t of tests) {
      clock.tick(120, 4, 4, QUARTER)

      const time = Math.round(1000 * clock.time) / 1000

      expect(time).to.equal(t.expected)
    }
  })

  it('default clock tick @48kHz', function () {
    const tests = [
      { expected: 0.0 },
      { expected: 2.667 },
      { expected: 5.333 },
      { expected: 8.0 },
      { expected: 10.667 },
      { expected: 13.333 },
      { expected: 16.0 },
    ]

    const clock = new Clock()

    clock.fs = 48000

    for (const t of tests) {
      clock.tick(120, 4, 4, QUARTER)

      const time = Math.round(1000 * clock.time) / 1000

      expect(time).to.equal(t.expected)
    }
  })
})

// t = (1000*60/BPM) * fs /(1000 * N)
// @120BPM: t = 500 * 44100 /(1000 * 128)
describe('tests clock *:4 time, 44kHz', function () {
  const Δt = (1000 * 128) / 44100

  it('validate click 4:4 time @120BPM', function () {
    const tests = [
      // beat: 1.1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1.2, 500ms
      { tick: 171, expected: { click: false, beat: 1 } },
      { tick: 172, expected: { click: true, beat: 2 } },
      { tick: 173, expected: { click: false, beat: 2 } },

      // beat: 1.3, 1000ms
      { tick: 343, expected: { click: false, beat: 2 } },
      { tick: 344, expected: { click: true, beat: 3 } },
      { tick: 345, expected: { click: false, beat: 3 } },

      // beat: 1.4, 1500ms
      { tick: 515, expected: { click: false, beat: 3 } },
      { tick: 516, expected: { click: true, beat: 4 } },
      { tick: 517, expected: { click: false, beat: 4 } },

      // beat: 2.1, 2000ms
      { tick: 688, expected: { click: false, beat: 4 } },
      { tick: 689, expected: { click: true, beat: 1 } },
      { tick: 690, expected: { click: false, beat: 1 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 120, 4, 4, QUARTER)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('validate click 3:4 time @120BPM', function () {
    const tests = [
      // beat: 1.1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1.2, 500ms
      { tick: 171, expected: { click: false, beat: 1 } },
      { tick: 172, expected: { click: true, beat: 2 } },
      { tick: 173, expected: { click: false, beat: 2 } },

      // beat: 1.3, 1000ms
      { tick: 343, expected: { click: false, beat: 2 } },
      { tick: 344, expected: { click: true, beat: 3 } },
      { tick: 345, expected: { click: false, beat: 3 } },

      // beat: 2.1, 1500ms
      { tick: 515, expected: { click: false, beat: 3 } },
      { tick: 516, expected: { click: true, beat: 1 } },
      { tick: 517, expected: { click: false, beat: 1 } },

      // beat: 2.2, 2000ms
      { tick: 688, expected: { click: false, beat: 1 } },
      { tick: 689, expected: { click: true, beat: 2 } },
      { tick: 690, expected: { click: false, beat: 2 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 120, 3, 4, QUARTER)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('validate click 3:4 time @120BPM, eighth note doublets', function () {
    const tests = [
      // beat: 1:1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1:1.5,250ms
      { tick: 85, expected: { click: false, beat: 1 } },
      { tick: 86, expected: { click: true, beat: 1.5 } },
      { tick: 87, expected: { click: false, beat: 1.5 } },

      // beat: 1:2, 500ms
      { tick: 171, expected: { click: false, beat: 1.5 } },
      { tick: 172, expected: { click: true, beat: 2 } },
      { tick: 173, expected: { click: false, beat: 2 } },

      // beat: 1:2.5,750ms
      { tick: 257, expected: { click: false, beat: 2 } },
      { tick: 258, expected: { click: true, beat: 2.5 } },
      { tick: 259, expected: { click: false, beat: 2.5 } },

      // beat: 1.3, 1000ms
      { tick: 343, expected: { click: false, beat: 2.5 } },
      { tick: 344, expected: { click: true, beat: 3 } },
      { tick: 345, expected: { click: false, beat: 3 } },

      // beat: 1:3.5,1250ms
      { tick: 429, expected: { click: false, beat: 3 } },
      { tick: 430, expected: { click: true, beat: 3.5 } },
      { tick: 431, expected: { click: false, beat: 3.5 } },

      // beat: 2:1, 1500ms
      { tick: 515, expected: { click: false, beat: 3.5 } },
      { tick: 516, expected: { click: true, beat: 1 } },
      { tick: 517, expected: { click: false, beat: 1 } },

      // beat: 2:1.5,1750ms
      { tick: 601, expected: { click: false, beat: 1 } },
      { tick: 602, expected: { click: true, beat: 1.5 } },
      { tick: 603, expected: { click: false, beat: 1.5 } },

      // beat: 2.2, 2000ms
      { tick: 688, expected: { click: false, beat: 1.5 } },
      { tick: 689, expected: { click: true, beat: 2 } },
      { tick: 690, expected: { click: false, beat: 2 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 120, 3, 4, EIGHTH_DOUBLET)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('validate handling for multiple beat gaps (4:4 time @120BPM)', function () {
    const tests = [
      // beat: 1.1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1.2, 500ms
      { tick: 171, expected: { click: false, beat: 1 } },
      { tick: 172, expected: { click: true, beat: 2 } },
      { tick: 173, expected: { click: false, beat: 2 } },

      // beat: 1.3, 1000ms
      { tick: 343, expected: { click: false, beat: 2 } },
      { tick: 344, expected: { click: true, beat: 3 } },
      { tick: 345, expected: { click: false, beat: 3 } },

      // beat: 1.4, 1500ms
      { tick: 515, expected: { click: false, beat: 3 } },
      { tick: 516, expected: { click: true, beat: 4 } },
      { tick: 517, expected: { click: false, beat: 4 } },

      // beat: 2.1, 2000ms
      { tick: 688, expected: { click: false, beat: 4 } },
      { tick: 689, expected: { click: true, beat: 1 } },
      { tick: 690, expected: { click: false, beat: 1 } },
    ]

    for (const t of tests) {
      const clock = new Clock()
      const click = clock.click(t.tick, 120, 4, 4, 0.25)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })
})

describe.skip('tests clock *:2 time, 44.1kHz', function () {
  const Δt = (1000 * 128) / 44100

  it('2:2, quarter notes time @120BPM', function () {
    const tests = [
      // beat: 1:1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1:1.5, 500ms
      { tick: 171, expected: { click: false, beat: 1 } },
      { tick: 172, expected: { click: true, beat: 1.5 } },
      { tick: 173, expected: { click: false, beat: 1.5 } },

      // beat: 1:2, 1000ms
      { tick: 343, expected: { click: false, beat: 1.5 } },
      { tick: 344, expected: { click: true, beat: 2 } },
      { tick: 345, expected: { click: false, beat: 2 } },

      // beat: 1:2.5, 1500ms
      { tick: 515, expected: { click: false, beat: 2 } },
      { tick: 516, expected: { click: true, beat: 2.5 } },
      { tick: 517, expected: { click: false, beat: 2.5 } },

      // beat: 2.1, 2000ms
      { tick: 688, expected: { click: false, beat: 2.5 } },
      { tick: 689, expected: { click: true, beat: 1 } },
      { tick: 690, expected: { click: false, beat: 1 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 120, 2, 2, 0.25)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beats:${beat}`)
    }
  })
})

describe.skip('tests clock 6:8 time, 44.1kHz', function () {
  const Δt = (1000 * 128) / 44100

  it('eighths @60PM', function () {
    const tests = [
      // beat: 1.1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1.2, 1000ms
      { tick: 343, expected: { click: false, beat: 1 } },
      { tick: 344, expected: { click: true, beat: 2 } },
      { tick: 345, expected: { click: false, beat: 2 } },

      // beat: 1.3, 2000ms
      { tick: 688, expected: { click: false, beat: 2 } },
      { tick: 689, expected: { click: true, beat: 3 } },
      { tick: 670, expected: { click: false, beat: 3 } },

      // beat: 1.4, 3000ms
      { tick: 1032, expected: { click: false, beat: 3 } },
      { tick: 1033, expected: { click: true, beat: 4 } },
      { tick: 1034, expected: { click: false, beat: 4 } },

      // beat: 1.5, 4000ms
      { tick: 1377, expected: { click: false, beat: 4 } },
      { tick: 1378, expected: { click: true, beat: 5 } },
      { tick: 1379, expected: { click: false, beat: 5 } },

      // beat: 1.6, 5000ms
      { tick: 1721, expected: { click: false, beat: 5 } },
      { tick: 1722, expected: { click: true, beat: 6 } },
      { tick: 1723, expected: { click: false, beat: 6 } },

      // beat: 2.1, 6000ms
      { tick: 2066, expected: { click: false, beat: 6 } },
      { tick: 2067, expected: { click: true, beat: 1 } },
      { tick: 2068, expected: { click: false, beat: 1 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 60, 6, 8, 0.125)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('eighths @120PM', function () {
    const tests = [
      // beat: 1.1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1.2, 500ms
      { tick: 171, expected: { click: false, beat: 1 } },
      { tick: 172, expected: { click: true, beat: 2 } },
      { tick: 173, expected: { click: false, beat: 2 } },

      // beat: 1.3, 1000ms
      { tick: 343, expected: { click: false, beat: 2 } },
      { tick: 344, expected: { click: true, beat: 3 } },
      { tick: 345, expected: { click: false, beat: 3 } },

      // beat: 1.4, 1500ms
      { tick: 515, expected: { click: false, beat: 3 } },
      { tick: 516, expected: { click: true, beat: 4 } },
      { tick: 517, expected: { click: false, beat: 4 } },

      // beat: 1.5, 2000ms
      { tick: 688, expected: { click: false, beat: 4 } },
      { tick: 689, expected: { click: true, beat: 5 } },
      { tick: 690, expected: { click: false, beat: 5 } },

      // beat: 1.6, 2500ms
      { tick: 860, expected: { click: false, beat: 5 } },
      { tick: 861, expected: { click: true, beat: 6 } },
      { tick: 862, expected: { click: false, beat: 6 } },

      // beat: 2.1, 3000ms
      { tick: 1032, expected: { click: false, beat: 6 } },
      { tick: 1033, expected: { click: true, beat: 1 } },
      { tick: 1034, expected: { click: false, beat: 1 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 120, 6, 8, 0.125)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('quarter notes @60PM', function () {
    const tests = [
      // beat: 1.1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1.2, 500ms
      { tick: 171, expected: { click: false, beat: 1 } },
      { tick: 172, expected: { click: false, beat: 2 } },
      { tick: 173, expected: { click: false, beat: 2 } },

      // beat: 1.3, 1000ms
      { tick: 343, expected: { click: false, beat: 2 } },
      { tick: 344, expected: { click: true, beat: 3 } },
      { tick: 345, expected: { click: false, beat: 3 } },

      // beat: 1.4, 1500ms
      { tick: 515, expected: { click: false, beat: 3 } },
      { tick: 516, expected: { click: false, beat: 4 } },
      { tick: 517, expected: { click: false, beat: 4 } },

      // beat: 1.5, 2000ms
      { tick: 688, expected: { click: false, beat: 4 } },
      { tick: 689, expected: { click: true, beat: 5 } },
      { tick: 690, expected: { click: false, beat: 5 } },

      // beat: 1.6, 2500ms
      { tick: 860, expected: { click: false, beat: 5 } },
      { tick: 861, expected: { click: false, beat: 6 } },
      { tick: 862, expected: { click: false, beat: 6 } },

      // beat: 2.1, 3000ms
      { tick: 1032, expected: { click: false, beat: 6 } },
      { tick: 1033, expected: { click: true, beat: 1 } },
      { tick: 1034, expected: { click: false, beat: 1 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 60, 6, 8, 0.25)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('dotted-quarter @60PM', function () {
    const tests = [
      // beat: 1.1, 0ms
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 1, expected: { click: false, beat: 1 } },

      // beat: 1.2, 333ms
      { tick: 113, expected: { click: false, beat: 1 } },
      { tick: 114, expected: { click: false, beat: 2 } },
      { tick: 115, expected: { click: false, beat: 2 } },

      // beat: 1.3, 667ms
      { tick: 228, expected: { click: false, beat: 2 } },
      { tick: 229, expected: { click: false, beat: 3 } },
      { tick: 230, expected: { click: false, beat: 3 } },

      // beat: 1.4, 1000ms
      { tick: 343, expected: { click: false, beat: 3 } },
      { tick: 344, expected: { click: true, beat: 4 } },
      { tick: 345, expected: { click: false, beat: 4 } },

      // beat: 1.5, 1333ms
      { tick: 458, expected: { click: false, beat: 4 } },
      { tick: 459, expected: { click: false, beat: 5 } },
      { tick: 460, expected: { click: false, beat: 5 } },

      // beat: 1.6, 1667ms
      { tick: 573, expected: { click: false, beat: 5 } },
      { tick: 574, expected: { click: false, beat: 6 } },
      { tick: 575, expected: { click: false, beat: 6 } },

      // beat: 2.1, 2000ms
      { tick: 688, expected: { click: false, beat: 6 } },
      { tick: 689, expected: { click: true, beat: 1 } },
      { tick: 690, expected: { click: false, beat: 1 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 60, 6, 8, 0.375)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })
})

describe('tests changing time signature/pulse, 44.1kHz', function () {
  const Δt = (1000 * 128) / 44100

  it('change from eighth note doublets to quarter notes after whole beat (3:4 time, 120BPM)', function () {
    const tests = [
      // beat: 1:1, 0ms, eighth doublets
      { tick: 0, pulse: EIGHTH, expected: { click: true, beat: 1 } },
      { tick: 1, pulse: EIGHTH, expected: { click: false, beat: 1 } },

      // beat: 1:1.5,250ms, eighth doublets
      { tick: 85, pulse: EIGHTH, expected: { click: false, beat: 1 } },
      { tick: 86, pulse: EIGHTH, expected: { click: true, beat: 1.5 } },
      { tick: 87, pulse: EIGHTH, expected: { click: false, beat: 1.5 } },

      // beat: 1:2, 500ms, eighth doublets
      { tick: 171, pulse: EIGHTH, expected: { click: false, beat: 1.5 } },
      { tick: 172, pulse: EIGHTH, expected: { click: true, beat: 2 } },
      { tick: 173, pulse: EIGHTH, expected: { click: false, beat: 2 } },

      // beat: 1:2.5,750ms, quarter notes
      { tick: 257, pulse: QUARTER, expected: { click: false, beat: 2 } },
      { tick: 258, pulse: QUARTER, expected: { click: false, beat: 2 } },
      { tick: 259, pulse: QUARTER, expected: { click: false, beat: 2 } },

      // beat: 1.3, 1000ms, quarter notes
      { tick: 343, pulse: QUARTER, expected: { click: false, beat: 2 } },
      { tick: 344, pulse: QUARTER, expected: { click: true, beat: 3 } },
      { tick: 345, pulse: QUARTER, expected: { click: false, beat: 3 } },

      // beat: 1:3.5,1250ms, quarter notes
      { tick: 429, pulse: QUARTER, expected: { click: false, beat: 3 } },
      { tick: 430, pulse: QUARTER, expected: { click: false, beat: 3 } },
      { tick: 431, pulse: QUARTER, expected: { click: false, beat: 3 } },

      // beat: 2:1, 1500ms, quarter notes
      { tick: 515, pulse: QUARTER, expected: { click: false, beat: 3 } },
      { tick: 516, pulse: QUARTER, expected: { click: true, beat: 1 } },
      { tick: 517, pulse: QUARTER, expected: { click: false, beat: 1 } },

      // beat: 2:1.5,1750ms, quarter notes
      { tick: 601, pulse: QUARTER, expected: { click: false, beat: 1 } },
      { tick: 602, pulse: QUARTER, expected: { click: false, beat: 1 } },
      { tick: 603, pulse: QUARTER, expected: { click: false, beat: 1 } },

      // beat: 2.2, 2000ms, quarter notes
      { tick: 688, pulse: QUARTER, expected: { click: false, beat: 1 } },
      { tick: 689, pulse: QUARTER, expected: { click: true, beat: 2 } },
      { tick: 690, pulse: QUARTER, expected: { click: false, beat: 2 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 120, 3, 4, t.pulse)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('validate change from eighth note doublets to quarter notes after half beat (3:4 time, 120BPM)', function () {
    const tests = [
      // beat: 1:1, 0ms, eighth doublets
      { tick: 0, pulse: EIGHTH, expected: { click: true, beat: 1 } },
      { tick: 1, pulse: EIGHTH, expected: { click: false, beat: 1 } },

      // beat: 1:1.5,250ms, eighth doublets
      { tick: 85, pulse: EIGHTH, expected: { click: false, beat: 1 } },
      { tick: 86, pulse: EIGHTH, expected: { click: true, beat: 1.5 } },
      { tick: 87, pulse: EIGHTH, expected: { click: false, beat: 1.5 } },

      // beat: 1:2, 500ms, eighth doublets
      { tick: 171, pulse: EIGHTH, expected: { click: false, beat: 1.5 } },
      { tick: 172, pulse: EIGHTH, expected: { click: true, beat: 2 } },
      { tick: 173, pulse: EIGHTH, expected: { click: false, beat: 2 } },

      // beat: 1:2.5,750ms, eighth doublets
      { tick: 257, pulse: EIGHTH, expected: { click: false, beat: 2 } },
      { tick: 258, pulse: EIGHTH, expected: { click: true, beat: 2.5 } },
      { tick: 259, pulse: EIGHTH, expected: { click: false, beat: 2.5 } },

      // beat: 1.3, 1000ms, quarter notes
      { tick: 343, pulse: QUARTER, expected: { click: false, beat: 2 } },
      { tick: 344, pulse: QUARTER, expected: { click: true, beat: 3 } },
      { tick: 345, pulse: QUARTER, expected: { click: false, beat: 3 } },

      // beat: 1:3.5,1250ms, quarter notes
      { tick: 429, pulse: QUARTER, expected: { click: false, beat: 3 } },
      { tick: 430, pulse: QUARTER, expected: { click: false, beat: 3 } },
      { tick: 431, pulse: QUARTER, expected: { click: false, beat: 3 } },

      // beat: 2:1, 1500ms, quarter notes
      { tick: 515, pulse: QUARTER, expected: { click: false, beat: 3 } },
      { tick: 516, pulse: QUARTER, expected: { click: true, beat: 1 } },
      { tick: 517, pulse: QUARTER, expected: { click: false, beat: 1 } },

      // beat: 2:1.5,1750ms, quarter notes
      { tick: 601, pulse: QUARTER, expected: { click: false, beat: 1 } },
      { tick: 602, pulse: QUARTER, expected: { click: false, beat: 1 } },
      { tick: 603, pulse: QUARTER, expected: { click: false, beat: 1 } },

      // beat: 2.2, 2000ms, quarter notes
      { tick: 688, pulse: QUARTER, expected: { click: false, beat: 1 } },
      { tick: 689, pulse: QUARTER, expected: { click: true, beat: 2 } },
      { tick: 690, pulse: QUARTER, expected: { click: false, beat: 2 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const click = clock.click(t.tick, 120, 3, 4, t.pulse)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(click).to.equal(t.expected.click, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  click:${click}`)
      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })
})

describe('tests for out-of-sequence beats, 44.1kHz', function () {
  it('4:4 time, 120BPM, quarter notes', function () {
    this.timeout(30000)

    const sequence = [1, 2, 3, 4]
    const interval = 500
    const clock = new Clock()
    let ix = 0

    for (let tick = 0; tick < 10 * 60 * 44100; tick++) {
      clock.tick(120, 4, 4, QUARTER)

      const click = clock.click(tick, 120, 4, 4, QUARTER)
      const time = clock.time

      if (click) {
        const beat = clock.beat
        const expected = sequence[ix % sequence.length]

        expect(beat).to.equal(expected, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
        expect(time).to.be.closeTo(ix * interval, 3.0, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)

        ix++
      }
    }
  })

  it('3:4 time, 120BPM, quarter notes', function () {
    this.timeout(30000)

    const sequence = [1, 2, 3]
    const interval = 500
    const clock = new Clock()
    let ix = 0

    for (let tick = 0; tick < 10 * 60 * 44100; tick++) {
      clock.tick(120, 3, 4, QUARTER)

      const click = clock.click(tick, 120, 3, 4, QUARTER)
      const time = clock.time

      if (click) {
        const beat = clock.beat
        const expected = sequence[ix % sequence.length]

        expect(beat).to.equal(expected, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
        expect(time).to.be.closeTo(ix * interval, 3.0, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)

        ix++
      }
    }
  })

  it('3:4 time, 120BPM, eighth note doublets', function () {
    this.timeout(30000)

    const sequence = [1, 1.5, 2, 2.5, 3, 3.5]
    const interval = 250
    const clock = new Clock()
    let ix = 0

    for (let tick = 0; tick < 10 * 60 * 44100; tick++) {
      clock.tick(120, 3, 4, EIGHTH)

      const click = clock.click(clock.tick, 120, 3, 4, EIGHTH)
      const time = clock.time

      if (click) {
        const beat = clock.beat
        const expected = sequence[ix % sequence.length]

        expect(beat).to.equal(expected, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
        expect(time).to.be.closeTo(ix * interval, 3.0, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)

        ix++
      }
    }
  })

  it('3:4 time, 43BPM, eighth note doublets', function () {
    this.timeout(30000)

    const sequence = [1, 1.5, 2, 2.5, 3, 3.5]
    const interval = 60000 / 43 / 2
    const clock = new Clock()
    let ix = 0

    for (let tick = 0; tick < 60000; tick++) {
      clock.tick(43, 3, 4, EIGHTH)

      const click = clock.click(clock.tick, 43, 3, 4, EIGHTH)
      const time = clock.time

      if (click) {
        const beat = clock.beat
        const expected = sequence[ix % sequence.length]

        expect(beat).to.equal(expected, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
        expect(time).to.be.closeTo(ix * interval, 3.0, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)

        ix++
      }
    }
  })
})

describe('tests for out-of-sequence beats, 48kHz', function () {
  const fs = 48000

  it('3:4 time, 43BPM, eighth note doublets', function () {
    this.timeout(30000)

    const sequence = [1, 1.5, 2, 2.5, 3, 3.5]
    const interval = 60000 / 43 / 2
    const clock = new Clock()

    clock.fs = fs
    let ix = 0

    for (let tick = 0; tick < 60000; tick++) {
      clock.tick(43, 3, 4, 0.125)

      const click = clock.click(tick, 43, 3, 4, EIGHTH)
      const time = clock.time

      if (click) {
        const beat = clock.beat
        const expected = sequence[ix % sequence.length]

        expect(beat).to.equal(expected, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
        expect(time).to.be.closeTo(ix * interval, 3.0, `tick:${tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)

        ix++
      }
    }
  })
})

describe('edge cases', function () {
  it('integer multiples of beat (3:4 time, 120BPM, eighth note doublets, 44.1kHz)', function () {
    const Δt = (1000 * 128) / 44100

    const tests = [
      { tick: 0, expected: { click: true, beat: 1 } },
      { tick: 11025, expected: { click: true, beat: 2 } },
      { tick: 22050, expected: { click: true, beat: 3 } },
      { tick: 33075, expected: { click: true, beat: 1 } },
      { tick: 44100, expected: { click: true, beat: 2 } },
    ]

    const clock = new Clock()

    for (const t of tests) {
      const _click = clock.click(t.tick, 120, 3, 4, EIGHTH)
      const beat = clock.beat
      const time = t.tick * Δt

      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })

  it('tick:56249, 3:4 time, 43BPM, eighth note doublets, 48kHz - click falls between 149999.99999999997ms and 150000ms)', function () {
    const fs = 48000
    const Δt = (1000 * 128) / fs

    const tests = [
      // ... setup
      { tick: 54941, expected: { click: true, beat: 1 } },
      { tick: 55203, expected: { click: true, beat: 1.5 } },
      { tick: 55465, expected: { click: true, beat: 2 } },
      { tick: 55726, expected: { click: true, beat: 2.5 } },
      { tick: 55988, expected: { click: true, beat: 3 } },

      // ... edge case
      { tick: 56248, expected: { click: false, beat: 3 } },
      { tick: 56249, expected: { click: true, beat: 3.5 } },
      { tick: 56250, expected: { click: false, beat: 3.5 } },
    ]

    const clock = new Clock()
    clock.fs = fs

    for (const t of tests) {
      const time = t.tick * Δt
      const _click = clock.click(t.tick, 43, 3, 4, EIGHTH)
      const beat = clock.beat

      expect(beat).to.equal(t.expected.beat, `tick:${t.tick}  time:${Math.round(10 * time) / 10}  beat:${beat}`)
    }
  })
})
