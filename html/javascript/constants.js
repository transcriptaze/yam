export const INF = Number.POSITIVE_INFINITY

export const DEFAULT = {
  COLOUR: '#00ff00',
  UUID: '00000000-0000-0000-0000-000000000000',
}

export const RANDOM = {
  UUID: '00000000-0000-0000-0000-000000000001',
  TITLE: '« random »',
}

export const DIVISIONS = [1, 2, 4, 8, 16, 32]
export const PULSES = ['eighth', 'eighth-doublet', 'quarter', 'dotted-quarter', 'half', 'dotted-half']

// ... roles
export const COUNT_IN = 'count-in'
export const ANACRUSIS = 'anacrusis'
export const INTRO = 'intro'
export const VERSE = 'verse'
export const CHORUS = 'chorus'
export const BRIDGE = 'bridge'
export const TURNAROUND = 'turnaround'
export const OUTRO = 'outro'

// prettier-ignore
export const ROLES = new Map([
  [COUNT_IN,   { name:'Count In',   colour: [ '#d69574' ] ,            contrast: '#1d4b63' }],  // warm apricot
  [ANACRUSIS,  { name:'Pickup',     colour: [ '#cbb469' ] ,            contrast: '#21305f' }],  // golden olive
  [INTRO,      { name:'Intro',      colour: [ '#df8880' ] ,            contrast: '#1a5f66' }],  // coral blush
  [VERSE,      { name:'Verse',      colour: [ '#b3bc69', '#64aa6f' ] , contrast: '#2c2758' }],  // moss green
  [CHORUS,     { name:'Chorus',     colour: [ '#84b5d2', '#3e7eb3' ] , contrast: '#5d3822' }],  // sky steel blue
  [BRIDGE,     { name:'Bridge',     colour: [ '#a7a8cb' ] ,            contrast: '#504f2f' }],  // lavender gray
  [TURNAROUND, { name:'Turnaround', colour: [ '#da8aaa' ] ,            contrast: '#1e6147' }],  // rose plum
  [OUTRO,      { name:'Outro',      colour: [ '#86c0b5' ] ,            contrast: '#542c33' }],  // mint teal
])

// prettier-ignore
export const OTHER = {
  COLOURS: [
    { colour:  '#cb96b2' , contrast: '#2a553e' }, // plum
    { colour:  '#71a9a0' , contrast: '#4f3035' }, // teal
    { colour:  '#b29f69' , contrast: '#2b3654' }, // ochre
    { colour:  '#7197b8' , contrast: '#553e2a' }, // blue
  ]
}

export const COLOURS = new Map([
  ...[...ROLES.values()].map((v) => [v.colour, v.contrast]),
  ...OTHER.COLOURS.map((v) => [v.colour, v.contrast]),
])

export const EVENTS = {
  PLAY: 'play',
  STOP: 'stop',
  BACK: 'back',
  NEXT: 'next',

  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  CLICK: 'click',

  SHUFFLE_PLAYLISTS: 'shuffle-playlists',

  TOGGLE_PLAYLIST: 'playlist-toggle',
  SELECT_PLAYLIST: 'playlist-select',
  EDIT_PLAYLIST: 'playlist-edit',
  SHUFFLE_PLAYLIST: 'playlist-shuffle',
  DELETE_PLAYLIST: 'playlist-delete',

  PLAYLIST_CHANGED: 'playlist-changed',

  SELECT_TRACK: 'select-track',
  MUTE_TRACK: 'mute-track',
  DELETE_TRACK: 'delete-track',
  NEW_TRACK: 'new-track',

  EDIT_SAVE: 'edit-save',
  SECTION_TIME_SIGNATURE_CHANGE: 'section-time-signature-change',
  SECTION_PULSE_CHANGE: 'section-pulse-change',
  SECTION_BPM_CHANGE: 'section-bpm-change',
  SECTION_MEASURES_CHANGE: 'section-measures-change',
  SECTION_EXPAND: 'section-expand',
  SECTION_CHANGED: 'section-changed',
}
