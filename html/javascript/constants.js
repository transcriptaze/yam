export const INF = Number.POSITIVE_INFINITY

export const DEFAULT = {
  COLOUR: '#00ff00',
  UUID: '00000000-0000-0000-0000-000000000000',
}

// prettier-ignore
export const ROLES = new Map([
  ['count-in',   { name:'Count In',   colour: [ '#d69574' ] ,            contrast: '#1d4b63' }],  // warm apricot
  ['anacrusis',  { name:'Pickup',     colour: [ '#cbb469' ] ,            contrast: '#21305f' }],  // golden olive
  ['intro',      { name:'Intro',      colour: [ '#df8880' ] ,            contrast: '#1a5f66' }],  // coral blush
  ['verse',      { name:'Verse',      colour: [ '#b3bc69', '#64aa6f' ] , contrast: '#2c2758' }],  // moss green
  ['chorus',     { name:'Chorus',     colour: [ '#84b5d2', '#3e7eb3' ] , contrast: '#5d3822' }],  // sky steel blue
  ['bridge',     { name:'Bridge',     colour: [ '#a7a8cb' ] ,            contrast: '#504f2f' }],  // lavender gray
  ['turnaround', { name:'Turnaround', colour: [ '#da8aaa' ] ,            contrast: '#1e6147' }],  // rose plum
  ['outro',      { name:'Outro',      colour: [ '#86c0b5' ] ,            contrast: '#542c33' }],  // mint teal
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
  SHUFFLE_PLAYLISTS: 'shuffle-playlists',

  TOGGLE_PLAYLIST: 'toggle-playlist',
  SELECT_PLAYLIST: 'select-playlist',
  EDIT_PLAYLIST: 'edit-playlist',
  SHUFFLE_PLAYLIST: 'shuffle-playlist',
  DELETE_PLAYLIST: 'delete-playlist',

  SELECT_TRACK: 'select-track',
  MUTE_TRACK: 'mute-track',
  DELETE_TRACK: 'delete-track',

  EDIT_SAVE: 'edit-save',
}
