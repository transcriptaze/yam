import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as compiler from '../../html/javascript/audio/compiler.js'

describe('tests compiler.compile', function () {
  it('1:4, 120BPM, quarter notes', function () {
    const track = JSON.stringify({
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: '2:4, 120BPM, quarter notes',
      tempo: 120,
      timeSignature: '2:4',
      pulse: 'quarter',
    })

    // prettier-ignore
    const expected = [
      `start:`, 
      `   @1  tick`,
      `   @2  tock`,
      `   jmp start`]

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('2:4, 120BPM, quarter notes', function () {
    const track = JSON.stringify({
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: '2:4, 120BPM, quarter notes',
      tempo: 120,
      timeSignature: '2:4',
      pulse: 'quarter',
    })

    // prettier-ignore
    const expected = [
      `start:`, 
      `   @1  tick`,
      `   @2  tock`,
      `   jmp start`]

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('3:4, 120BPM, quarter notes', function () {
    const track = JSON.stringify({
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: '3:4, 120BPM, quarter notes',
      tempo: 120,
      timeSignature: '3:4',
      pulse: 'quarter',
    })

    // prettier-ignore
    const expected = [
      `start:`, 
      `   @1  tick`,
      `   @2  tock`,
      `   @3  tock`,
      `   jmp start`]

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('4:4, 120BPM, quarter notes', function () {
    const track = JSON.stringify({
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: '4:4, 120BPM, quarter notes',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
    })

    // prettier-ignore
    const expected = [
      `start:`, 
      `   @1  tick`,
      `   @2  tock`,
      `   @3  tock`,
      `   @4  tock`,
      `   jmp start`]

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('4:4, 120BPM, quarter notes', function () {
    const track = JSON.stringify({
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: '4:4, 120BPM, quarter notes',
      tempo: 120,
      timeSignature: '4:4',
      pulse: 'quarter',
    })

    // prettier-ignore
    const expected = [
      `start:`, 
      `   @1  tick`,
      `   @2  tock`,
      `   @3  tock`,
      `   @4  tock`,
      `   jmp start`]

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })

  it('5:4, 120BPM, quarter notes', function () {
    const track = JSON.stringify({
      UUID: 'ad60619f-a1dc-4df9-85d8-c6750fdc32b7',
      title: '5:4, 120BPM, quarter notes',
      tempo: 120,
      timeSignature: '5:4',
      pulse: 'quarter',
    })

    // prettier-ignore
    const expected = [
      `start:`, 
      `   @1  tick`,
      `   @2  tock`,
      `   @3  tock`,
      `   @4  tock`,
      `   @5  tock`,
      `   jmp start`]

    const script = compiler.compile(track)

    expect(script).to.deep.equal(expected)
  })
})
