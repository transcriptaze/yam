export const OPCODES = {
  NONE: 'none',
  STOP: 'stop',
  DELAY: 'delay',
  TICK: 'tick',
  TOCK: 'tock',
  TACK: 'tack',
  STICKS: 'sticks',
  DING: 'ding',
  DONG: 'dong', // conditional 'ding'
  SKIP: 'skip',
  PLAY: 'play',
  TEMPO: 'tempo',
  TIME_SIGNATURE: 'time-signature',
  SUBDIVISIONS: 'subdivisions',
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
