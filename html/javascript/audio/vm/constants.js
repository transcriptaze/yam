export const OPCODES = {
  NONE: 0,
  DELAY: 1,
  TICK: 2,
  TOCK: 3,
  TACK: 4,
  STICK: 5,
  DING: 6,
}

export const SUBDIVISIONS = {
  EIGHTH_NOTES: 'eighth',
  EIGHTH_DOUBLETS: 'eighth-doublet',
  EIGHTH_TRIPLETS: 'eighth-triplet',
  QUARTER_NOTES: 'quarter',
  DOTTED_QUARTERS: 'dotted-quarter',
  HALF_NOTES: 'half',
  DOTTED_HALF_NOTES: 'dotted-half',
}

export const EIGHTH_NOTES = SUBDIVISIONS.EIGHTH_NOTES
export const EIGHTH_DOUBLETS = SUBDIVISIONS.EIGHTH_DOUBLETS
export const EIGHTH_TRIPLETS = SUBDIVISIONS.EIGHTH_TRIPLETS
export const QUARTER_NOTES = SUBDIVISIONS.QUARTER_NOTES
export const DOTTED_QUARTER_NOTES = SUBDIVISIONS.DOTTED_QUARTERS
export const HALF_NOTES = SUBDIVISIONS.HALF_NOTES
export const DOTTED_HALF_NOTES = SUBDIVISIONS.DOTTED_HALF_NOTES

const subdivisions = new Map([
  [1, EIGHTH_NOTES],
  [2, EIGHTH_DOUBLETS],
  [3, EIGHTH_TRIPLETS],
  [4, QUARTER_NOTES],
  [5, DOTTED_QUARTER_NOTES],
  [6, HALF_NOTES],
  [7, DOTTED_HALF_NOTES],
])

export function int2subdivisions(i) {
  return subdivisions.get(i)
}

export function subdivisions2int(subdivision) {
  return subdivisions.entries().find(([_, v]) => v === subdivision)?.[0] ?? Number.NaN
}
