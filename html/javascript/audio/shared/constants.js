// pulse parameter encoding

export const EIGHTH = 1
export const EIGHTH_DOUBLET = 2
export const QUARTER = 3
export const DOTTED_QUARTER = 4
export const HALF = 5
export const DOTTED_HALF = 6

// prettier-ignore
const PULSE = new Map([
  [EIGHTH,         { name: 'eighth',         interval: 0.125 }],
  [EIGHTH_DOUBLET, { name: 'eighth-doublet', interval: 0.125 }],
  [QUARTER,        { name: 'quarter',        interval: 0.25 }],
  [DOTTED_QUARTER, { name: 'dotted-quarter', interval: 0.375 }],
  [HALF,           { name: 'half',           interval: 0.5 }],
  [DOTTED_HALF,    { name: 'dotted-half',    interval: 0.75 }],
])

export function pulseToInt(pulse) {
  return PULSE.entries().find(([_, v]) => v.name === pulse)?.[0] ?? Number.NaN
}

export function get(int) {
  return PULSE.get(int)
}
