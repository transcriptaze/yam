import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as util from '../../html/javascript/util.js'

describe('tests utility functions', function () {
  it('durationToMS', function () {
    // prettier-ignore
    const tests = [
      { v: -5,    expected: 0 },
      { v: 0,     expected: 0 },
      { v: 5,     expected: 0 },

      { v: '5ms',     expected: 5 },
      { v: '5 ms',    expected: 5 },
      { v: '-5ms',    expected: 0 },
      { v: '60000ms', expected: 60000 },

      { v: '5s',  expected: 5000 },
      { v: '5 s', expected: 5000 },
      { v: '-5s', expected: 0    },
      { v: '60s', expected: 60000 },
    ]

    for (const test of tests) {
      const ms = util.durationToMS(test.v)

      expect(ms).to.equal(test.expected)
    }
  })

  it('parseTimeSignature', function () {
    // prettier-ignore
    const tests = [
      { v: undefined, expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: null, expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '',   expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '*',  expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '3',  expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '3:', expected: {beats:Number.NaN, divisions:Number.NaN} },

      { v: '0:4',  expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '1:4',  expected: {beats:1,  divisions:4} },
      { v: '3:4',  expected: {beats:3,  divisions:4} },
      { v: '4:4',  expected: {beats:4,  divisions:4} },
      { v: '5:4',  expected: {beats:5,  divisions:4} },
      { v: '32:4', expected: {beats:32, divisions:4} },
      { v: '33:4', expected: {beats:Number.NaN, divisions:Number.NaN} },

      { v: '4:0',  expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '4:1',  expected: {beats:4,  divisions:1} },
      { v: '4:2',  expected: {beats:4,  divisions:2} },
      { v: '4:3',  expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '4:4',  expected: {beats:4,  divisions:4} },
      { v: '4:5',  expected: {beats:Number.NaN, divisions:Number.NaN} },
      { v: '4:8',  expected: {beats:4,  divisions:8}  },
      { v: '4:16', expected: {beats:4,  divisions:16} },
      { v: '4:32', expected: {beats:4,  divisions:32} },
    ]

    for (const test of tests) {
      const { beats, divisions } = util.parseTimeSignature(test.v)

      if (Number.isNaN(test.expected.beats)) {
        expect(beats).to.be.NaN
      } else {
        expect(beats).to.equal(test.expected.beats)
      }

      if (Number.isNaN(test.expected.divisions)) {
        expect(divisions).to.be.NaN
      } else {
        expect(divisions).to.equal(test.expected.divisions)
      }
    }
  })

  it('normaliseTag', function () {
    // prettier-ignore
    const tests = [
      { tag: undefined,            normalised: '' },
      { tag: null,                 normalised: '' },
      { tag: '',                   normalised: '' },
      { tag: '    ',               normalised: '' },
      { tag: 'qwerty',             normalised: 'qwerty' },
      { tag: 'qWerty',             normalised: 'qWerty' },
      { tag: 'qwerty Uiop',        normalised: 'qwerty Uiop' },
      { tag: 'qwerty  Uiop',       normalised: 'qwerty Uiop' },
      { tag: 'qwe rty  Uio    p',  normalised: 'qwe rty Uio p' },
    ]

    for (const test of tests) {
      const tag = util.normaliseTag(test.tag)

      expect(tag).to.equal(test.normalised)
    }
  })
})
