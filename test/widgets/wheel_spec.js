import { wrap } from '../../html/javascript/widgets/util.js'
import { describe, it } from 'mocha'
import { expect } from 'chai'

describe('tests wheel wrap logic', function () {
  it('validate 87° bar', function () {
    const offset = 87

    // prettier-ignore
    const tests = [
      { rotation: 0,     expected:  77.8181 }, 
      { rotation: 1,     expected:  77.8181 }, 
      { rotation: 2,     expected:  77.8181 }, 
      { rotation: 3,     expected:  77.8181 }, 
      { rotation: 3.001, expected: 165.0909 }, 
      { rotation: 6,     expected: 165.0909 }, 
    ]

    for (const t of tests) {
      expect(wrap(offset, t.rotation), `<angle: ${t.rotation}>`).to.be.closeTo(t.expected, 0.0001)
    }
  })

  it('validate -87° bar', function () {
    const offset = -87

    // prettier-ignore
    const tests = [
      { rotation:  0,     expected: 162.1818 }, 
      { rotation: -1,     expected: 162.1818 }, 
      { rotation: -2,     expected: 162.1818 }, 
      { rotation: -3,     expected: 162.1818 }, 
      { rotation: -3.001, expected:  74.9091 }, 
      { rotation: -6,     expected:  74.9091 }, 
    ]

    for (const t of tests) {
      expect(wrap(offset, t.rotation), `<angle: ${t.rotation}>`).to.be.closeTo(t.expected, 0.0001)
    }
  })
})
