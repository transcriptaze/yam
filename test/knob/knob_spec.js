import { tap } from '../../html/javascript/components/knob.js'
import { describe, it } from 'mocha'
import { expect } from 'chai'

// prettier-ignore
const BPM40 = {
  P0:   { x: -25.882, y: -96.593 },  // 0°

  Q5:   { x: -34.202,  y: -93.969 }, // +5°
  Q5A:  { x: -33.381,  y: -94.264 }, // +5° - 0.5°
  Q5B:  { x: -35.021,  y: -93.667 }, // +5° + 0.5°

  Q45:  { x: -86.603,  y: -50.000 }, // +45°
  Q45A: { x: -86.163,  y: -50.754 }, // +45° - 0.5°
  Q45B: { x: -87.036,  y: -49.242 }, // +45° + 0.5°

  Q75:  { x: -100.000, y:  0.000 }, // +75°
  Q75A: { x: -99.996,  y: -0.873 }, // +75° - 0.5°
  Q75B: { x: -99.996,  y:  0.873 }, // +75° + 0.5°

  R5:   { x: -17.365, y: -98.481 }, // -5°
  R5A:  { x: -18.224, y: -98.325 }, // -5° + 0.5°
  R5B:  { x: -16.505, y: -98.629 }, // -5° - 0.5°

  R45:  { x:  50.000, y: -86.603 }, // -45°
  R45A: { x:  49.242, y: -87.036 }, // -45° + 0.5°
  R45B: { x:  50.754, y: -86.163 }, // -45° - 0.5°

  R75:  { x:  86.603, y: -50.000 }, // -75°
  R75A: { x:  86.163, y: -50.754 }, // -75° + 0.5°
  R75B: { x:  87.036, y: -49.242 }, // -75° - 0.5°
}

// prettier-ignore
const BPM120 = {
  P0:   { x: 0.000, y: 100.0 },  // 0°

  Q5:   { x: 8.716,  y: 99.619 }, // +5°
  Q5A:  { x: 7.846,  y: 99.692 }, // +5° - 0.5°
  Q5B:  { x: 9.585,  y: 99.540 }, // +5° + 0.5°

  Q45:  { x: 70.711, y: 70.711 }, // +45°
  Q45A: { x: 70.091, y: 71.325 }, // +45° - 0.5°
  Q45B: { x: 71.325, y: 70.091 }, // +45° + 0.5°

  Q75:  { x: 96.593, y: 25.882 }, // +75°
  Q75A: { x: 96.363, y: 26.724 }, // +75° - 0.5°
  Q75B: { x: 96.815, y: 25.038 }, // +75° + 0.5°

  R5:   { x: -8.716, y: 99.619 }, // -5°
  R5A:  { x: -7.846, y: 99.692 }, // -5° + 0.5°
  R5B:  { x: -9.585, y: 99.540 }, // -5° - 0.5°

  R45:  { x: -70.711, y: 70.711 }, // -45°
  R45A: { x: -70.091, y: 71.325 }, // -45° + 0.5°
  R45B: { x: -71.325, y: 70.091 }, // -45° - 0.5°

  R75:  { x: -96.593, y: 25.882 }, // -75°
  R75A: { x: -96.363, y: 26.724 }, // -75° + 0.5°
  R75B: { x: -96.815, y: 25.038 }, // -75° - 0.5°
}

// prettier-ignore
const BPM200 = {
  P0:   { x:25.882, y: -96.593 },  // 0°

  Q5:   { x: 17.365,  y: -98.481 }, // +5°
  Q5A:  { x: 18.224,  y: -98.325 }, // +5° - 0.5°
  Q5B:  { x: 16.505,  y: -98.629 }, // +5° + 0.5°

  Q45:  { x: -50.000, y: -86.603 }, // +45°
  Q45A: { x: -49.242, y: -87.036 }, // +45° - 0.5°
  Q45B: { x: -50.754, y: -86.163 }, // +45° + 0.5°

  Q75:  { x: -86.603, y: -50.000 }, // +75°
  Q75A: { x: -86.163, y: -50.754 }, // +75° - 0.5°
  Q75B: { x: -87.036, y: -49.242 }, // +75° + 0.5°

  R5:   { x: 34.202,  y: -93.969 }, // -5°
  R5A:  { x: 33.381,  y: -94.264 }, // -5° + 0.5°
  R5B:  { x: 35.021,  y: -93.667 }, // -5° - 0.5°

  R45:  { x: 86.603,  y: -50.000 }, // -45°
  R45A: { x: 86.163,  y: -50.754 }, // -45° + 0.5°
  R45B: { x: 87.036,  y: -49.242 }, // -45° - 0.5°

  R75:  { x: 100.000, y:  0.000 }, // -75°
  R75A: { x:  99.996, y: -0.873 }, // -75° + 0.5°
  R75B: { x:  99.996, y:  0.873 }, // -75° - 0.5°
}

describe('tests tap parabola logic', function () {
  it("validate 'fine mode' taps for rotated knob @ 40BPM (15°)", function () {
    const points = BPM40

    // prettier-ignore
    const tests = [
      { x: points.P0.x,   y: points.P0.y,   expected: ''  }, 

      { x: points.Q5A.x,  y: points.Q5A.y,  expected: ''  }, 
      { x: points.Q5B.x,  y: points.Q5B.y,  expected: '+' }, 
      { x: points.Q45A.x, y: points.Q45A.y, expected: '+' }, 
      { x: points.Q45B.x, y: points.Q45B.y, expected: ''  }, 
      { x: points.Q75A.x, y: points.Q75A.y, expected: ''  }, 
      { x: points.Q75B.x, y: points.Q75B.y, expected: ''  }, 

      { x: points.R5A.x,  y: points.R5A.y,  expected: ''  }, 
      { x: points.R5B.x,  y: points.R5B.y,  expected: '-' }, 
      { x: points.R45A.x, y: points.R45A.y, expected: '-' }, 
      { x: points.R45B.x, y: points.R45B.y, expected: ''  }, 
      { x: points.R75A.x, y: points.R75A.y, expected: ''  }, 
      { x: points.R75B.x, y: points.R75B.y, expected: ''  }, 
    ]

    for (const t of tests) {
      expect(tap(t.x, t.y, 15, false)).to.equal(t.expected)
    }
  })

  it("validate 'coarse mode' taps for rotated knob @ 40BPM (15°)", function () {
    const points = BPM40

    // prettier-ignore
    const tests = [
      { x: points.P0.x,   y: points.P0.y,   expected: ''  }, 

      { x: points.Q5A.x,  y: points.Q5A.y,  expected: ''  }, 
      { x: points.Q5B.x,  y: points.Q5B.y,  expected: '+' }, 
      { x: points.Q45A.x, y: points.Q45A.y, expected: '+' }, 
      { x: points.Q45B.x, y: points.Q45B.y, expected: '+' }, 
      { x: points.Q75A.x, y: points.Q75A.y, expected: '+' }, 
      { x: points.Q75B.x, y: points.Q75B.y, expected: ''  }, 

      { x: points.R5A.x,  y: points.R5A.y,  expected: ''  }, 
      { x: points.R5B.x,  y: points.R5B.y,  expected: '-' }, 
      { x: points.R45A.x, y: points.R45A.y, expected: '-' }, 
      { x: points.R45B.x, y: points.R45B.y, expected: '-' }, 
      { x: points.R75A.x, y: points.R75A.y, expected: '-' }, 
      { x: points.R75B.x, y: points.R75B.y, expected: ''  }, 
    ]

    for (const t of tests) {
      expect(tap(t.x, t.y, 15, true)).to.equal(t.expected)
    }
  })

  it("validate 'fine mode' taps for rotated knob @ 120BPM (180°)", function () {
    const points = BPM120

    // prettier-ignore
    const tests = [
      { x: points.P0.x,   y: points.P0.y,   expected: ''  },
    
      { x: points.Q5A.x,  y: points.Q5A.y,  expected: ''  },
      { x: points.Q5B.x,  y: points.Q5B.y,  expected: '+' },
      { x: points.Q45A.x, y: points.Q45A.y, expected: '+' },
      { x: points.Q45B.x, y: points.Q45B.y, expected: ''  },
      { x: points.Q75A.x, y: points.Q75A.y, expected: ''  },
      { x: points.Q75B.x, y: points.Q75B.y, expected: ''  },

      { x: points.R5A.x,  y: points.R5A.y,  expected: ''  },
      { x: points.R5B.x,  y: points.R5B.y,  expected: '-' },
      { x: points.R45A.x, y: points.R45A.y, expected: '-' },
      { x: points.R45B.x, y: points.R45B.y, expected: ''  },
      { x: points.R75A.x, y: points.R75A.y, expected: ''  },
      { x: points.R75B.x, y: points.R75B.y, expected: ''  },
    ]

    for (const t of tests) {
      expect(tap(t.x, t.y, 180, false)).to.equal(t.expected)
    }
  })

  it("validate 'coarse mode' taps for rotated knob @ 120BPM (180°)", function () {
    const points = BPM120

    // prettier-ignore
    const tests = [
      { x: points.P0.x,   y: points.P0.y,   expected: ''  },
    
      { x: points.Q5A.x,  y: points.Q5A.y,  expected: ''  },
      { x: points.Q5B.x,  y: points.Q5B.y,  expected: '+' },
      { x: points.Q45A.x, y: points.Q45A.y, expected: '+' },
      { x: points.Q45B.x, y: points.Q45B.y, expected: '+' },
      { x: points.Q75A.x, y: points.Q75A.y, expected: '+' },
      { x: points.Q75B.x, y: points.Q75B.y, expected: ''  },
    
      { x: points.R5A.x,  y: points.R5A.y,  expected: ''  },
      { x: points.R5B.x,  y: points.R5B.y,  expected: '-' },
      { x: points.R45A.x, y: points.R45A.y, expected: '-' },
      { x: points.R45B.x, y: points.R45B.y, expected: '-' },
      { x: points.R75A.x, y: points.R75A.y, expected: '-' },
      { x: points.R75B.x, y: points.R75B.y, expected: ''  },
    ]

    for (const t of tests) {
      expect(tap(t.x, t.y, 180, true)).to.equal(t.expected)
    }
  })

  it("validate 'fine mode' taps for rotated knob @ 200BPM (180°)", function () {
    const points = BPM200

    // prettier-ignore
    const tests = [
      { x: points.P0.x,   y: points.P0.y,   expected: ''  },
    
      { x: points.Q5A.x,  y: points.Q5A.y,  expected: ''  },
      { x: points.Q5B.x,  y: points.Q5B.y,  expected: '+' },
      { x: points.Q45A.x, y: points.Q45A.y, expected: '+' },
      { x: points.Q45B.x, y: points.Q45B.y, expected: ''  },
      { x: points.Q75A.x, y: points.Q75A.y, expected: ''  },
      { x: points.Q75B.x, y: points.Q75B.y, expected: ''  },

      { x: points.R5A.x,  y: points.R5A.y,  expected: ''  },
      { x: points.R5B.x,  y: points.R5B.y,  expected: '-' },
      { x: points.R45A.x, y: points.R45A.y, expected: '-' },
      { x: points.R45B.x, y: points.R45B.y, expected: ''  },
      { x: points.R75A.x, y: points.R75A.y, expected: ''  },
      { x: points.R75B.x, y: points.R75B.y, expected: ''  },
    ]

    for (const t of tests) {
      expect(tap(t.x, t.y, 345, false)).to.equal(t.expected)
    }
  })

  it("validate 'coarse mode' taps for rotated knob @ 200BPM (180°)", function () {
    const points = BPM200

    // prettier-ignore
    const tests = [
      { x: points.P0.x,   y: points.P0.y,   expected: ''  },
    
      { x: points.Q5A.x,  y: points.Q5A.y,  expected: ''  },
      { x: points.Q5B.x,  y: points.Q5B.y,  expected: '+' },
      { x: points.Q45A.x, y: points.Q45A.y, expected: '+' },
      { x: points.Q45B.x, y: points.Q45B.y, expected: '+' },
      { x: points.Q75A.x, y: points.Q75A.y, expected: '+' },
      { x: points.Q75B.x, y: points.Q75B.y, expected: ''  },
    
      { x: points.R5A.x,  y: points.R5A.y,  expected: ''  },
      { x: points.R5B.x,  y: points.R5B.y,  expected: '-' },
      { x: points.R45A.x, y: points.R45A.y, expected: '-' },
      { x: points.R45B.x, y: points.R45B.y, expected: '-' },
      { x: points.R75A.x, y: points.R75A.y, expected: '-' },
      { x: points.R75B.x, y: points.R75B.y, expected: ''  },
    ]

    for (const t of tests) {
      expect(tap(t.x, t.y, 345, true)).to.equal(t.expected)
    }
  })
})
