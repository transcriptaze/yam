import { describe, it } from 'mocha'
import { expect } from 'chai'
import { VM, OPCODES } from '../../../html/javascript/audio/vm/vm.js'

describe('tests VM.tick', function () {
  it('zero length program', function () {
    // prettier-ignore
    const program = []
    const vm = new VM(44100, 128, program)
    const op = vm.tick()
    const expected = OPCODES.NONE

    expect(op).to.deep.equal(expected)
  })

  it('delay', function () {
    // prettier-ignore
    const program = [
      {
        operation: 'delay',
        at: 10.0,
        duration: '15ms ',
      }
    ]

    const vm = new VM(44100, 128, program)

    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 0.0
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 2.902ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 5.805ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 5.805ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 8.707ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 11.610ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 14.512ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 17.415ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 20.317ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 23.220ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 26.122sms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 29.025ms
    expect(vm.tick()).to.deep.equal(OPCODES.NONE) // 31.927ms
  })
})
