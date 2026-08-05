import { describe, it } from 'mocha'
import { expect } from 'chai'
import { VM } from '../../html/javascript/audio/vm/vm.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'

describe('tests VM.tick', function () {
  it('zero length program', function () {
    // prettier-ignore
    const program = []
    const vm = new VM(44100, 128, program)
    const op = vm.tick()
    const expected = OPCODES.NONE

    expect(op).to.deep.equal(expected)
  })

  // it('delay', function () {
  //   // prettier-ignore
  //   const program = [
  //     {
  //       operation: 'delay',
  //       at: 10.0,
  //       duration: '15ms ',
  //     }
  //   ]
  //
  //   const vm = new VM(44100, 128, program)
  //
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 0.0
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 2.902ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 5.805ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 5.805ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 8.707ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 11.610ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 14.512ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 17.415ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 20.317ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 23.220ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 26.122sms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 29.025ms
  //   expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 31.927ms
  // })
})

describe('tests VM.exec', function () {
  it('exec::tick/tock/tack/sticks', function () {
    const worklet = {
      tick() {
        return ['tick']
      },

      tock() {
        return ['tock']
      },

      tack() {
        return ['tack']
      },

      sticks() {
        return ['sticks']
      },

      ding() {
        return ['ding']
      },
    }

    // prettier-ignore
    const script = [
      { beat:1, op: OPCODES.TICK },
      { beat:2, op: OPCODES.TOCK },
      { beat:4, op: OPCODES.TACK },
      { beat:6, op: OPCODES.STICKS },
      { beat:8, op: OPCODES.DING },
    ]

    const vm = new VM(44100, 128, worklet, script)

    expect(vm.exec(1)).to.deep.equal(['tick'])
    expect(vm.exec(2)).to.deep.equal(['tock'])
    expect(vm.exec(3)).to.deep.equal([])
    expect(vm.exec(4)).to.deep.equal(['tack'])
    expect(vm.exec(5)).to.deep.equal([])
    expect(vm.exec(6)).to.deep.equal(['sticks'])
    expect(vm.exec(7)).to.deep.equal([])
    expect(vm.exec(8)).to.deep.equal(['ding'])
  })
})
