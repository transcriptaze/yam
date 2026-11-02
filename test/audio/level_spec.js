import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as level from '../../html/javascript/audio/worklets/level.js'

const FS = 48000

describe('fade-in/fade-out on start/stop', function () {
  it('fade-in', function () {
    const l = new level.Level(FS)

    expect(l.level).to.equal(0)

    // ~64ms to fade in
    expect(l.fadeIn()).to.be.approximately(0.2634, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.4574, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.6003, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.7056, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.7831, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.8402, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.8823, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9133, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9361, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.953, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9654, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9745, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9812, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9862, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9898, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9925, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9945, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9959, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.997, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9978, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9984, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9988, 0.0001)
    expect(l.fadeIn()).to.be.approximately(0.9991, 0.0001)
    expect(l.fadeIn()).to.be.approximately(1.0, 0.0001)
    expect(l.fadeIn()).to.be.approximately(1.0, 0.0001)
  })

  it('fade-out', function () {
    const l = new level.Level(FS)

    while (l.level < 1) {
      l.fadeIn()
    }

    // ~64ms to fade in
    expect(l.level).to.equal(1)
    expect(l.fadeOut()).to.be.approximately(0.7366, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.5426, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.3997, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.2944, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.2169, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.1598, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.1177, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0867, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0639, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.047, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0346, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0255, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0188, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0138, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0102, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0075, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0055, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.004, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.003, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0022, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0016, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0012, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0009, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0, 0.0001)
    expect(l.fadeOut()).to.be.approximately(0.0, 0.0001)
  })
})
