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
  [COUNT_IN,   { name:'Count In',   colour: [ '--role-count-in'  ] ,               contrast: '--role-count-in-text'   }],
  [ANACRUSIS,  { name:'Pickup',     colour: [ '--role-anacrusis' ] ,               contrast: '--role-anacrusis-text'  }],
  [INTRO,      { name:'Intro',      colour: [ '--role-intro'     ] ,               contrast: '--role-intro-text'      }],
  [VERSE,      { name:'Verse',      colour: [ '--role-verse',  '--role-verse1' ],  contrast: '--role-verse-text'      }],
  [CHORUS,     { name:'Chorus',     colour: [ '--role-chorus', '--role-chorus1' ], contrast: '--role-chorus-text'     }],
  [BRIDGE,     { name:'Bridge',     colour: [ '--role-bridge' ] ,                  contrast: '--role-bridge-text'     }],
  [TURNAROUND, { name:'Turnaround', colour: [ '--role-turnaround' ] ,              contrast: '--role-turnaround-text' }],
  [OUTRO,      { name:'Outro',      colour: [ '--role-outro' ] ,                   contrast: '--role-outro-text'      }],
])

// prettier-ignore
export const OTHER = {
  COLOURS: [
    { colour:  '--role-other' ,  contrast: '--role-other-text'  },
    { colour:  '--role-other1' , contrast: '--role-other1-text' },
    { colour:  '--role-other2' , contrast: '--role-other2-text' },
    { colour:  '--role-other3' , contrast: '--role-other3-text' },
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
  STOPPED: 'stopped',
  CLICK: 'click',
  DONE: 'done',

  SHUFFLE_PLAYLISTS: 'shuffle-playlists',

  TOGGLE_PLAYLIST: 'playlist-toggle',
  SELECT_PLAYLIST: 'playlist-select',
  EDIT_PLAYLIST: 'playlist-edit',
  DELETE_PLAYLIST: 'playlist-delete',

  PLAYLIST_SELECTED: 'playlist-selected',
  PLAYLIST_CHANGED: 'playlist-changed',
  PLAYLIST_TRACK_DELETED: 'playlist-track-deleted',
  PLAYLIST_TRACK_MUTED: 'muted',
  PLAYLIST_TRACK_UNMUTED: 'unmuted',
  PLAYLIST_STATISTICS: 'playlist-statistics',

  TRACK_SELECT: 'select-track',
  TRACK_MUTE: 'mute-track',
  TRACK_DELETE: 'delete-track',
  TRACK_STATISTICS: 'track-statistics',
  TRACK_WAV: 'track-wav',

  EDIT_SAVE: 'edit-save',
  SECTION_TIME_SIGNATURE_CHANGE: 'section-time-signature-change',
  SECTION_PULSE_CHANGE: 'section-pulse-change',
  SECTION_BPM_CHANGE: 'section-bpm-change',
  SECTION_MEASURES_CHANGE: 'section-measures-change',
  SECTION_EXPAND: 'section-expand',
  SECTION_CHANGED: 'section-changed',
}
