import { describe, it } from 'mocha'
import { expect } from 'chai'
import { VM } from '../../html/javascript/audio/vm/vm.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'

describe('tests VM.tick', function () {
  it('BPM:120BPM, fs:44100, buffer:128, delay:0', function () {
    const BPM = 120
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, bufferSize, [])

    // prettier-ignore
    const tests = [
      { tick: 0,   time:    0.0000, click: 1 },
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
      { tick: 170, time:  493.4240 },
      { tick: 171, time:  496.3265 },
      { tick: 172, time:  499.2290, click: 2  },
      { tick: 173, time:  502.1315 },
      { tick: 343, time:  995.5556 },
      { tick: 344, time:  998.4580, click: 3 },
      { tick: 345, time: 1001.3605 },
    ]

    let tick = 0
    for (const test of tests) {
      while (tick < test.tick) {
        vm.tick(BPM)
        tick++
      }

      const { time, click } = vm.tick(BPM)
      tick++

      expect(time * 1000).to.be.approximately(test.time, 0.0001)
      expect(click).to.equal(test.click)
    }
  })
})

describe('tests VM.click', function () {
  it('click 2:4, quarter notes', function () {
    const timeSignature = { beats: 2, divisions: 4 }
    const fs = 44100
    const bufferSize = 128
    const vm = new VM(fs, bufferSize, [])

    // prettier-ignore
    const tests = [
      {click: 1.0, expected: { measure: 1, beat: 1}},
      {click: 2.0, expected: { measure: 1, beat: 2}},
      {click: 3.0, expected: { measure: 2, beat: 1}},
      {click: 4.0, expected: { measure: 2, beat: 2}},
      {click: 5.0, expected: { measure: 3, beat: 1}},
      {click: 6.0, expected: { measure: 3, beat: 2}},
      {click: 7.0, expected: { measure: 4, beat: 1}},
      {click: 8.0, expected: { measure: 4, beat: 2}},
      {click: 9.0, expected: { measure: 5, beat: 1}},
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
    const bufferSize = 128
    const vm = new VM(fs, bufferSize, [])

    // prettier-ignore
    const tests = [
      {click: 1.0, expected: { measure: 1, beat: 1}},
      {click: 2.0, expected: { measure: 1, beat: 2}},
      {click: 3.0, expected: { measure: 1, beat: 3}},
      {click: 4.0, expected: { measure: 2, beat: 1}},
      {click: 5.0, expected: { measure: 2, beat: 2}},
      {click: 6.0, expected: { measure: 2, beat: 3}},
      {click: 7.0, expected: { measure: 3, beat: 1}},
      {click: 8.0, expected: { measure: 3, beat: 2}},
      {click: 9.0, expected: { measure: 3, beat: 3}},
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
    const bufferSize = 128
    const vm = new VM(fs, bufferSize, [])

    // prettier-ignore
    const tests = [
      {click: 1.0, expected: { measure: 1, beat: 1}},
      {click: 2.0, expected: { measure: 1, beat: 2}},
      {click: 3.0, expected: { measure: 1, beat: 3}},
      {click: 4.0, expected: { measure: 1, beat: 4}},
      {click: 5.0, expected: { measure: 2, beat: 1}},
      {click: 6.0, expected: { measure: 2, beat: 2}},
      {click: 7.0, expected: { measure: 2, beat: 3}},
      {click: 8.0, expected: { measure: 2, beat: 4}},
      {click: 9.0, expected: { measure: 3, beat: 1}},
    ]

    for (const test of tests) {
      const expected = test.expected
      const { measure, beat } = vm.click(test.click, timeSignature)

      expect(measure).to.equal(expected.measure)
      expect(beat).to.equal(expected.beat)
    }
  })
})

describe('tests VM.exec', function () {
  it('exec::tick/tock/tack/sticks', function () {
    const fs = 44100
    const bufferSize = 128
    const script = [
      { at: { measure: 1, beat: 1 }, op: OPCODES.TICK },
      { at: { measure: 1, beat: 2 }, op: OPCODES.TOCK },
      { at: { measure: 1, beat: 4 }, op: OPCODES.TACK },
      { at: { measure: 2, beat: 2 }, op: OPCODES.STICKS },
      { at: { measure: 2, beat: 4 }, op: OPCODES.DING },
    ]

    const vm = new VM(fs, bufferSize, script)

    expect(vm.exec({ measure: 1, beat: 1 })).to.deep.equal([OPCODES.TICK])
    expect(vm.exec({ measure: 1, beat: 2 })).to.deep.equal([OPCODES.TOCK])
    expect(vm.exec({ measure: 1, beat: 3 })).to.deep.equal([])
    expect(vm.exec({ measure: 1, beat: 4 })).to.deep.equal([OPCODES.TACK])
    expect(vm.exec({ measure: 2, beat: 1 })).to.deep.equal([])
    expect(vm.exec({ measure: 2, beat: 2 })).to.deep.equal([OPCODES.STICKS])
    expect(vm.exec({ measure: 2, beat: 3 })).to.deep.equal([])
    expect(vm.exec({ measure: 2, beat: 4 })).to.deep.equal([OPCODES.DING])
  })

  it('exec, measure:*', function () {
    const fs = 44100
    const bufferSize = 128
    const script = [
      { at: { measure: '*', beat: 1 }, op: OPCODES.TICK },
      { at: { measure: '*', beat: 2 }, op: OPCODES.TOCK },
      { at: { measure: '*', beat: 4 }, op: OPCODES.TACK },
    ]

    const vm = new VM(fs, bufferSize, script)

    expect(vm.exec({ measure: 1, beat: 1 })).to.deep.equal([OPCODES.TICK])
    expect(vm.exec({ measure: 1, beat: 2 })).to.deep.equal([OPCODES.TOCK])
    expect(vm.exec({ measure: 1, beat: 3 })).to.deep.equal([])
    expect(vm.exec({ measure: 1, beat: 4 })).to.deep.equal([OPCODES.TACK])

    expect(vm.exec({ measure: 2, beat: 1 })).to.deep.equal([OPCODES.TICK])
    expect(vm.exec({ measure: 2, beat: 2 })).to.deep.equal([OPCODES.TOCK])
    expect(vm.exec({ measure: 2, beat: 3 })).to.deep.equal([])
    expect(vm.exec({ measure: 2, beat: 4 })).to.deep.equal([OPCODES.TACK])
  })
})
