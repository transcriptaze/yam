import * as models from '../models/models.js'
import * as statistics from '../statistics/statistics.js'
import * as datastore from '../datastore/datastore.js'
import * as log from '../log.js'
import * as fs from '../fs.js'

const LOGTAG = 'statistics'

export function initialise() {
  const params = new URLSearchParams(`${window.location.search}`)

  // ... load playlists, tracks and statistics
  Promise.all([models.playlists.restore(), models.tracks.restore(), statistics.restore()])
    .then(([_playlists, _tracks, statistics]) => {
      if (params.has('track')) {
        const UUID = params.get('track')

        if (UUID != null && UUID !== '') {
          const track = datastore.tracks.get(UUID)

          showTrack(track, statistics)
        }
      }
    })
    .catch((err) => warnf(err))
}

export function onSave() {
  statistics.get().then((object) => {
    fs.saveStatistics(object)
  })
}

export function onError(err) {
  console.error('ERROR', err)

  document.querySelector('#about')?.classList.add('error')
}

function showTrack(track, statistics) {
  const section = document.querySelector('#track')

  section.classList.remove('hidden')

  // ... header
  const title = section.querySelector('div.header #title')
  const timeSignature = section.querySelector('div.header #time-signature')
  const tempo = section.querySelector('div.header #tempo')
  const bars = section.querySelector('div.header #bars')

  title.innerText = track.title
  timeSignature.innerText = track.timeSignature
  tempo.innerText = `${track.tempo} BPM`

  if (track.countIn > 0 && track.pickup > 0) {
    bars.innerText = `Bars: ${track.countIn}+${track.pickup}+${track.bars - track.countIn - track.pickup}`
  } else if (track.countIn > 0) {
    bars.innerText = `Bars: ${track.countIn}+${track.bars - track.countIn}`
  } else if (track.pickup > 0) {
    bars.innerText = `Bars: ${track.pickup}+${track.bars - track.pickup}`
  } else {
    bars.innerText = `Bars: ${track.bars}`
  }

  // ... summary
  const summary = statistics.summarize(track)
  const played = section.querySelector('div.summary #played')
  const lastPlayed = section.querySelector('div.summary #last-played')
  const BPM = section.querySelector('div.summary #BPM')

  played.value = summary.played
  lastPlayed.value = summary.lastPlayed
  BPM.value = track.BPM
}

function warnf(err) {
  log.warnf(LOGTAG, `${err}`)
}
