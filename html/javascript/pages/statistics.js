import * as models from '../models/models.js'
import * as statistics from '../statistics/statistics.js'
import * as datastore from '../datastore/datastore.js'
import * as log from '../log.js'
import * as fs from '../fs.js'
import { INF } from '../constants.js'

const LOGTAG = 'statistics'
const MS_PER_DAY = 24 * 60 * 60 * 1000

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

  trackHeader(section, track, statistics)
  trackSummary(section, track, statistics)
  trackLastWeek(section, track, statistics)
}

function trackHeader(section, track, _statistics) {
  const title = section.querySelector('div.header #title')
  const timeSignature = section.querySelector('div.header #time-signature')
  const tempo = section.querySelector('div.header #tempo')
  const bars = section.querySelector('div.header #bars')

  title.innerText = track.title
  timeSignature.innerText = track.timeSignature
  tempo.innerText = `${track.tempo} BPM`

  if (track.countIn > 0 && track.pickup > 0 && track.bars > 0 && track.bars === INF) {
    bars.innerHTML = `Bars: ${track.countIn}+${track.pickup}+<span class="infinity">&infin;</span>`
  } else if (track.countIn > 0 && track.pickup > 0 && track.bars > 0) {
    bars.innerText = `Bars: ${track.countIn}+${track.pickup}+${track.bars - track.countIn - track.pickup}`
  } else if (track.countIn > 0 && track.bars === INF) {
    bars.innerHTML = `Bars: ${track.countIn}+<span class="infinity">&infin;</span>`
  } else if (track.countIn > 0) {
    bars.innerText = `Bars: ${track.countIn}+${track.bars - track.countIn}`
  } else if (track.pickup > 0 && track.bars === INF) {
    bars.innerHTML = `Bars: ${track.pickup}+<span class="infinity">&infin;</span>`
  } else if (track.pickup > 0) {
    bars.innerText = `Bars: ${track.pickup}+${track.bars - track.pickup}`
  } else if (bars === INF) {
    bars.innerHTML = `Bars: <span class="infinity">&infin;</span>`
  } else if (bars > 0) {
    bars.innerText = `Bars: ${track.bars}`
  } else {
    bars.innerText = `Bars: -`
  }
}

function trackSummary(section, track, statistics) {
  const stats = statistics.summarize(track.UUID)
  const played = section.querySelector('div.summary #played')
  const lastPlayed = section.querySelector('div.summary #last-played')
  const BPM = section.querySelector('div.summary #BPM')

  if (stats.played == 0) {
    played.value = `- never -`
  } else if (stats.played == 1) {
    played.value = `- once -`
  } else if (stats.played == 2) {
    played.value = `- twice -`
  } else {
    played.value = `${stats.played} times`
  }

  if (stats.lastPlayed == null) {
    lastPlayed.value = '- never -'
  } else {
    const now = new Date()
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    const played = Date.UTC(stats.lastPlayed.getFullYear(), stats.lastPlayed.getMonth(), stats.lastPlayed.getDate())
    const days = Math.max(0, Math.floor((today - played) / MS_PER_DAY))

    if (days == 0) {
      lastPlayed.value = `- today -`
    } else if (days == 1) {
      lastPlayed.value = `- yesterday -`
    } else if (days < 7) {
      lastPlayed.value = `${days} days ago`
    } else if (days < 14) {
      lastPlayed.value = `1–2 weeks ago`
    } else if (days <= 31) {
      lastPlayed.value = `sometime in the last month`
    } else {
      lastPlayed.value = `not for a good long while`
    }

    const year = `${stats.lastPlayed.getFullYear()}`.padStart(4, '0')
    const month = `${stats.lastPlayed.getMonth() + 1}`.padStart(2, '0')
    const day = `${stats.lastPlayed.getDate()}`.padStart(2, '0')

    lastPlayed.title = `${year}-${month}-${day}`
  }

  BPM.value = track.BPM
}

function trackLastWeek(section, track, statistics) {
  const stats = statistics.previousWeek(track.UUID)
  const played = section.querySelector('div.last-week #last-week-played')
  const graph = section.querySelector('div.last-week yam-bar-graph')

  if (stats.total == 0) {
    played.value = `- not even once -`
  } else if (stats.total == 1) {
    played.value = `- once -`
  } else if (stats.total == 2) {
    played.value = `- twice -`
  } else {
    played.value = `${stats.total} times`
  }

  graph.played = stats.played
}

function warnf(err) {
  log.warnf(LOGTAG, `${err}`)
}
