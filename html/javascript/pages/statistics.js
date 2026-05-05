import * as models from '../models/models.js'
import * as statistics from '../statistics/statistics.js'
import * as datastore from '../datastore/datastore.js'
import * as log from '../log.js'
import * as fs from '../fs.js'
import { parseTimeSignature } from '../util.js'
import { INF } from '../constants.js'

const LOGTAG = 'statistics'
const MS_PER_DAY = 24 * 60 * 60 * 1000

const TACTUS = new Map([
  ['1', './images/time-signatures/tactus/1.svg'],
  ['2', './images/time-signatures/tactus/2.svg'],
  ['3', './images/time-signatures/tactus/3.svg'],
  ['4', './images/time-signatures/tactus/4.svg'],
  ['5', './images/time-signatures/tactus/5.svg'],
  ['6', './images/time-signatures/tactus/6.svg'],
  ['7', './images/time-signatures/tactus/7.svg'],
  ['8', './images/time-signatures/tactus/8.svg'],
  ['9', './images/time-signatures/tactus/9.svg'],
  ['10', './images/time-signatures/tactus/10.svg'],
  ['11', './images/time-signatures/tactus/11.svg'],
  ['12', './images/time-signatures/tactus/12.svg'],
  ['13', './images/time-signatures/tactus/13.svg'],
  ['14', './images/time-signatures/tactus/14.svg'],
  ['15', './images/time-signatures/tactus/15.svg'],
  ['16', './images/time-signatures/tactus/16.svg'],
  ['17', './images/time-signatures/tactus/17.svg'],
  ['18', './images/time-signatures/tactus/18.svg'],
  ['19', './images/time-signatures/tactus/19.svg'],
  ['20', './images/time-signatures/tactus/20.svg'],
  ['21', './images/time-signatures/tactus/21.svg'],
  ['22', './images/time-signatures/tactus/22.svg'],
  ['23', './images/time-signatures/tactus/23.svg'],
  ['24', './images/time-signatures/tactus/24.svg'],
  ['25', './images/time-signatures/tactus/25.svg'],
  ['26', './images/time-signatures/tactus/26.svg'],
  ['27', './images/time-signatures/tactus/27.svg'],
  ['28', './images/time-signatures/tactus/28.svg'],
  ['29', './images/time-signatures/tactus/29.svg'],
  ['30', './images/time-signatures/tactus/30.svg'],
  ['31', './images/time-signatures/tactus/31.svg'],
  ['32', './images/time-signatures/tactus/32.svg'],
])

const FIGURA = new Map([
  ['1', './images/time-signatures/figura/1.svg'],
  ['2', './images/time-signatures/figura/2.svg'],
  ['4', './images/time-signatures/figura/4.svg'],
  ['8', './images/time-signatures/figura/8.svg'],
  ['16', './images/time-signatures/figura/16.svg'],
  ['32', './images/time-signatures/figura/32.svg'],
])

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
  const tactus = timeSignature.querySelector('.tactus')
  const figura = timeSignature.querySelector('.figura')
  const common = timeSignature.querySelector('.common')
  const cut = timeSignature.querySelector('.cut')
  const tempo = section.querySelector('div.header #tempo')
  const bars = section.querySelector('div.header #bars')

  title.innerText = track.title
  tempo.innerText = `${track.tempo} BPM`

  // ... time signature
  if (track.timeSignature === 'cut') {
    tactus.classList.add('hidden')
    figura.classList.add('hidden')
    common.classList.add('hidden')
    cut.classList.remove('hidden')
  } else if (track.timeSignature === 'common') {
    tactus.classList.add('hidden')
    figura.classList.add('hidden')
    common.classList.remove('hidden')
    cut.classList.add('hidden')
  } else {
    const { beats, divisions } = parseTimeSignature(track.timeSignature)

    if (TACTUS.has(`${beats}`)) {
      tactus.classList.remove('hidden')
      tactus.src = TACTUS.get(`${beats}`)
    } else {
      tactus.classList.add('hidden')
    }

    if (FIGURA.has(`${divisions}`)) {
      figura.classList.remove('hidden')
      figura.src = FIGURA.get(`${divisions}`)
    } else {
      figura.classList.add('hidden')
    }

    figura.classList.remove('hidden')
    common.classList.add('hidden')
    cut.classList.add('hidden')
  }

  // ... bars
  if (track.countIn > 0 && track.pickup > 0 && track.bars > 0 && track.bars === INF) {
    bars.innerHTML = `bars: ${track.countIn}+${track.pickup}+<span class="infinity">&infin;</span>`
  } else if (track.countIn > 0 && track.pickup > 0 && track.bars > 0) {
    bars.innerText = `${track.countIn}+${track.pickup}+${track.bars - track.countIn - track.pickup} bars`
  } else if (track.countIn > 0 && track.bars === INF) {
    bars.innerHTML = `bars: ${track.countIn}+<span class="infinity">&infin;</span>`
  } else if (track.countIn > 0) {
    bars.innerText = `${track.countIn}+${track.bars - track.countIn} bars`
  } else if (track.pickup > 0 && track.bars === INF) {
    bars.innerHTML = `bars: ${track.pickup}+<span class="infinity">&infin;</span>`
  } else if (track.pickup > 0) {
    bars.innerText = `${track.pickup}+${track.bars - track.pickup} bars`
  } else if (bars === INF) {
    bars.innerHTML = `bars: <span class="infinity">&infin;</span>`
  } else if (bars > 0) {
    bars.innerText = `${track.bars} bars`
  } else {
    bars.innerText = `bars: -`
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
  const played = section.querySelector('div.history.week input')
  const graph = section.querySelector('div.history.week yam-bar-graph')

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
