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
