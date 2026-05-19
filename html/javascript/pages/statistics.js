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

const widgets = {
  intervals: document.querySelectorAll('input[name="interval"]'),
}

let ERROR = null

export function initialise() {
  const params = new URLSearchParams(`${window.location.search}`)

  // ... load playlists, tracks and statistics
  Promise.all([models.playlists.restore(), models.tracks.restore(), statistics.restore()])
    .then(([_playlists, _tracks, statistics]) => {
      if (params.has('playlist')) {
        const UUID = params.get('playlist')

        if (UUID != null && UUID !== '') {
          const playlist = datastore.playlists.get(UUID)

          showPlaylist(playlist, statistics)

          widgets.intervals.forEach((v) => {
            v.addEventListener('change', (e) => onInterval(playlist, statistics, e.target.value))
          })
        }
      } else if (params.has('track')) {
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

  ERROR = err

  document.querySelector('#about').classList.add('hidden')
  document.querySelector('#oops').classList.remove('hidden')
  document.querySelector('#oops').title = `${err.message}`
}

export async function showError() {
  if (ERROR != null) {
    try {
      const msg = JSON.stringify(ERROR, null, '  ')

      alert(msg)
      await navigator.clipboard.writeText(msg)
    } catch (err) {
      console.error(err)
    }
  }

  document.querySelector('#about').classList.remove('hidden')
  document.querySelector('#oops').classList.add('hidden')
}

function showPlaylist(playlist, statistics) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  document.querySelector('#playlist').classList.remove('hidden')
  document.querySelector('#track').classList.add('hidden')

  playlistHeader(playlist, statistics)
  playlistSummary(playlist, statistics)
  playlistHistory(playlist, statistics, new Date(year, month, day - 14), 'weekdays-small')
}

function showTrack(track, statistics) {
  document.querySelector('#playlist').classList.add('hidden')
  document.querySelector('#track').classList.remove('hidden')

  const section = document.querySelector('#track')

  trackHeader(section, track, statistics)
  trackSummary(section, track, statistics)
  trackLastWeek(section, track, statistics)
  trackLastMonth(section, track, statistics)
}

function onInterval(playlist, statistics, interval) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()

  switch (interval) {
    case 'week':
      playlistHistory(playlist, statistics, new Date(year, month, day - 7), 'weekdays')
      break

    case 'fortnight':
      playlistHistory(playlist, statistics, new Date(year, month, day - 14), 'weekdays-small')
      break

    case 'month':
      playlistHistory(playlist, statistics, new Date(year, month - 1, day), 'none')
      break

    case 'quarter':
      playlistHistory(playlist, statistics, new Date(year, month - 3, day), 'none')
      break
  }
}

function playlistHeader(playlist, _statistics) {
  const section = document.querySelector('#playlist')
  const title = section.querySelector('div.header #title')

  title.innerText = playlist.title
}

function playlistSummary(_playlist, _statistics) {}

function playlistHistory(playlist, statistics, from, labels) {
  const section = document.querySelector('#playlist')
  const tracks = section.querySelector('div.history ul.tracks')
  const template = document.querySelector('#template-track')

  const now = new Date()
  const list = []

  playlist.tracks.forEach((v) => {
    const li = document.createElement('li')
    const div = document.importNode(template.content, true)
    const title = div.querySelector('.title')
    const graph = div.querySelector('yam-bar-graph')
    const stats = statistics.query(v.UUID, from, now)

    title.innerText = v.title

    graph.setAttribute('background', 'months')
    graph.setAttribute('labels', labels)
    graph.played = stats.played

    li.setAttribute('draggable', false)
    li.appendChild(div)

    list.push(li)
  })

  tracks.replaceChildren(...list)
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
    played.innerText = `- never -`
  } else if (stats.played == 1) {
    played.innerText = `- once -`
  } else if (stats.played == 2) {
    played.innerText = `- twice -`
  } else {
    played.innerText = `${stats.played} times`
  }

  if (stats.lastPlayed == null) {
    lastPlayed.value = '- never -'
  } else {
    const now = new Date()
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
    const played = Date.UTC(stats.lastPlayed.getFullYear(), stats.lastPlayed.getMonth(), stats.lastPlayed.getDate())
    const days = Math.max(0, Math.floor((today - played) / MS_PER_DAY))

    if (days == 0) {
      lastPlayed.innerText = `- today -`
    } else if (days == 1) {
      lastPlayed.innerText = `- yesterday -`
    } else if (days < 7) {
      lastPlayed.innerText = `${days} days ago`
    } else if (days < 14) {
      lastPlayed.innerText = `1–2 weeks ago`
    } else if (days <= 31) {
      lastPlayed.innerText = `sometime in the last month`
    } else {
      lastPlayed.innerText = `not for a good long while`
    }

    const year = `${stats.lastPlayed.getFullYear()}`.padStart(4, '0')
    const month = `${stats.lastPlayed.getMonth() + 1}`.padStart(2, '0')
    const day = `${stats.lastPlayed.getDate()}`.padStart(2, '0')

    lastPlayed.title = `${year}-${month}-${day}`
  }

  BPM.innerText = track.BPM
}

function trackLastWeek(section, track, statistics) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const from = new Date(year, month, day - 7)

  const stats = statistics.query(track.UUID, from, now)
  const played = section.querySelector('div.history.week span')
  const graph = section.querySelector('div.history.week yam-bar-graph')

  if (stats.total == 0) {
    played.innerText = `- not even once -`
  } else if (stats.total == 1) {
    played.innerText = `- once -`
  } else if (stats.total == 2) {
    played.innerText = `- twice -`
  } else {
    played.innerText = `${stats.total} times`
  }

  graph.played = stats.played
}

function trackLastMonth(section, track, statistics) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const from = new Date(year, month - 1, day)

  const stats = statistics.query(track.UUID, from, now)
  const played = section.querySelector('div.history.month span')
  const graph = section.querySelector('div.history.month yam-bar-graph')

  if (stats.total == 0) {
    played.innerText = `- not even once -`
  } else if (stats.total == 1) {
    played.innerText = `- once -`
  } else if (stats.total == 2) {
    played.innerText = `- twice -`
  } else {
    played.innerText = `${stats.total} times`
  }

  graph.played = stats.played
}

function warnf(err) {
  log.warnf(LOGTAG, `${err}`)
}
