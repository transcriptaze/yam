import * as engine from './audio/engine.js'
import * as models from './models/models.js'
import * as fs from './fs.js'
import { state } from './models/state.js'
import { settings } from './settings.js'
import * as log from './log.js'
import { DEFAULT, INF } from './constants.js'
import { EVENTS } from './constants.js'

const LOGTAG = 'YAM'

const widgets = {
  pads: document.querySelector('yam-pads'),
  info: document.querySelector('yam-info'),
  timeSignature: document.querySelector('div.metrics yam-time-signature'),
  mm: document.querySelector('div.metrics yam-mm'),
  loop: document.querySelector('div.metrics yam-loop'),
  knob: document.querySelector('yam-knob'),
  wheel: document.querySelector('yam-wheel'),
  metronome: document.querySelector('yam-metronome'),
  playlists: document.querySelector('yam-playlists'),
  editor: document.querySelector('yam-editor'),
}

let ID = 0

export function initialise() {
  // ... initialise WebAudio
  const webaudio = !!(window.AudioContext || window.webkitAudioContext || window.mozAudioContext)

  if (!webaudio) {
    window.location = '/unsupported.html'
    return
  }

  // ... attach event handlers
  rewire()

  // ... restore session
  settings.restore()

  engine.setBPM(settings.BPM)
  engine.setTimeSignature(settings.timeSignature)
  engine.setPulse(settings.pulse)

  state.initialise(settings)

  widgets.timeSignature.timeSignature = state.timeSignature
  widgets.timeSignature.locked = false

  widgets.mm.pulse = state.pulse
  widgets.mm.BPM = state.BPM
  widgets.mm.track = null

  widgets.loop.loop = state.loop
  widgets.loop.loops = INF
  widgets.knob.BPM = state.BPM
  widgets.knob.tempo = null

  // ... initialise playlists
  Promise.all([models.playlists.restore(), models.tracks.restore()])
    .then(([playlists, tracks]) => {
      widgets.playlists.initialise(playlists, tracks)

      // ... playlist in URL?
      const params = new URLSearchParams(`${window.location.search}`)
      if (params.has('playlist')) {
        const playlist = params.get('playlist')

        playlists.forEach((v) => {
          if (v.title === playlist || v.UUID === playlist) {
            settings.playlist = v.UUID
          }
        })
      }

      widgets.playlists.selected = {
        playlist: settings.playlist,
        track: null,
      }

      const playlist = models.playlists.playlist(settings.playlist)

      widgets.metronome.bof = playlist?.BOF(null) ?? true
      widgets.metronome.eof = playlist?.EOF(null) ?? true

      models.playlists.prune(models.tracks.tracks)
      models.tracks.prune(models.playlists)
    })
    .catch((err) => warnf(err))

  // ... setup audio engine
  engine.addEventListener(
    EVENTS.PLAYING,
    () => {
      widgets.metronome.onPlaying()
      requestAnimationFrame(() => animate(++ID))
    },
    false,
  )

  engine.addEventListener(
    EVENTS.STOPPED,
    () => {
      widgets.metronome.onStopped()
    },
    false,
  )

  widgets.metronome.enabled = true

  const href = `${window.location.href}`
  const matches = href.match(/(?:.*)(#.*)$/)

  if (matches != null && matches.length == 2) {
    const fragment = matches[1]

    if (fragment === '#playlist') {
      show('playlist')

      window.history.replaceState({}, '', '/index.html')
    }
  }
}

export function reset() {
  const UUID = state.playlist
  const playlist = models.playlists.playlist(UUID)
  const selected = playlist?.selected
  const track = models.tracks.track(selected)

  // ... revert selected track changes
  if (selected != null && track != null && state.modified) {
    state.reset({ title: track.title, BPM: track.BPM, timeSignature: track.timeSignature, pulse: track.pulse })
    return
  }

  // ... clear selected track
  if (selected != null) {
    playlist?.select(null)
    return
  }

  // ... revert to stored settings
  const saved = { title: '', BPM: settings.BPM, timeSignature: settings.timeSignature, pulse: settings.pulse }
  if (!state.equals(saved)) {
    state.reset(saved)
    return
  }

  // ... revert to defaults
  state.reset({ title: '', BPM: 120, timeSignature: '4:4', pulse: 'quarter' })

  settings.BPM = state.BPM
  settings.timeSignature = state.timeSignature
  settings.pulse = state.pulse
  settings.playlist = state.playlist
  settings.save()
}

export function show(page) {
  const toolbar = document.querySelector('toolbar')
  const metronome = document.querySelector('div.metronome')
  const playlists = document.querySelector('div.playlists')
  const editor = document.querySelector('div.editor')

  if (page === 'metronome') {
    toolbar.classList.add('metronome')
    toolbar.classList.remove('playlist')
    toolbar.classList.remove('editor')

    metronome.classList.remove('hidden')
    playlists.classList.add('hidden')
    editor.classList.add('hidden')
  }

  if (page === 'playlist') {
    toolbar.classList.remove('metronome')
    toolbar.classList.add('playlist')
    toolbar.classList.remove('editor')

    metronome.classList.add('hidden')
    playlists.classList.remove('hidden')
    editor.classList.add('hidden')
  }

  if (page === 'editor') {
    toolbar.classList.remove('metronome')
    toolbar.classList.remove('playlist')
    toolbar.classList.add('editor')

    metronome.classList.add('hidden')
    playlists.classList.add('hidden')
    editor.classList.remove('hidden')
  }
}

export function save() {
  const object = {
    playlists: models.playlists.object,
    tracks: models.tracks.object,
  }

  fs.save(object)
}

export function load() {
  const store = (object) => {
    if (object != null) {
      models.playlists.load(object.playlists, object.tracks)
      models.tracks.load(object.tracks)

      models.playlists.save()
      models.tracks.save()

      widgets.playlists.initialise(object.playlists, object.tracks)

      state.selected = {
        playlist: DEFAULT.UUID,
        track: null,
      }

      settings.playlist = DEFAULT.UUID
      settings.save()

      widgets.playlists.selected = {
        playlist: DEFAULT.UUID,
        track: null,
      }

      widgets.editor.track = null

      engine.stop()
      engine.load(null)
    }
  }

  const callback = (filename, object, err) => {
    const dialog = document.querySelector('dialog')
    const msg = dialog.querySelector('p.message')
    const ok = dialog.querySelector('button[value="ok"]')
    const cancel = dialog.querySelector('button[value="cancel"]')

    if (!!object && !err) {
      ok.disabled = false
      dialog.classList.remove('error')
      msg.innerHTML = filename ? `Import tracks from '${filename}'?` : `Import tracks from YAM file?`
    } else {
      ok.disabled = true
      dialog.classList.add('error')

      if (!err) {
        msg.innerHTML = filename ? `'${filename}' is not a valid YAM file` : `Invalid YAM file!`
      } else {
        msg.innerHTML = filename ? `Error loading file '${filename}'` : `Error loading YAM file!`
      }
    }

    ok.addEventListener('click', (event) => {
      event.preventDefault()
      dialog.close('ok')
    })

    cancel.addEventListener('click', (event) => {
      event.preventDefault()
      dialog.close('cancel')
    })

    dialog.addEventListener('close', () => {
      if (dialog.returnValue === 'ok') {
        store(object)
      }

      return true
    })

    dialog.showModal()
  }

  fs.load(callback)
}

export async function requestWakeLock() {
  const button = document.querySelector('#wakelock')

  state.requestWakeLock(button)

  document.addEventListener('visibilitychange', async (_e) => {
    if (document.visibilityState === 'visible') {
      state.requestWakeLock(button)
    }
  })
}

export async function toggleWakeLock() {
  const button = document.querySelector('#wakelock')

  state.toggleWakeLock(button)
}

export function debug() {
  // const vh = window.visualViewport?.height || window.innerHeight
  // const standalone = window.matchMedia('(display-mode: standalone)').matches
  //
  // alert(
  //   `version: 2025-07-28 18:40\nscreen:${screen.height}\nwindow:${window.innerHeight}\nviewport:${window.visualViewport.height.toFixed(2)}\nstandalone:${standalone}`,
  // )
  //
  // // HACK: force layout recalculation (Android + Chrome)
  // document.documentElement.style.setProperty('--vh', `${vh}px`)
}

// wire up event handlers
function rewire() {
  const knob = document.querySelector('yam-knob')
  const wheel = document.querySelector('yam-wheel')
  const timeSignature = document.querySelector('yam-time-signature')
  const info = document.querySelector('yam-info')

  timeSignature.addEventListener('change', (e) => onTimeSignature(e))
  widgets.mm.addEventListener('change', (e) => onMM(e))
  widgets.loop.addEventListener('change', (e) => onLoop(e))

  knob.addEventListener('change', () => onKnob(false))
  knob.addEventListener('changed', () => onKnob(true))
  wheel.addEventListener('change', () => onWheel(false))
  wheel.addEventListener('changed', () => onWheel(true))

  widgets.playlists.addEventListener('new', (e) => onPlaylistNew(e))
  widgets.playlists.addEventListener('change', (e) => onPlaylistChange(e))
  widgets.playlists.addEventListener(EVENTS.SHUFFLE_PLAYLISTS, (e) => onPlaylistsShuffled(e))
  widgets.playlists.addEventListener(EVENTS.SELECT_PLAYLIST, (e) => onPlaylistSelected(e))
  widgets.playlists.addEventListener(EVENTS.SHUFFLE_PLAYLIST, (e) => onPlaylistShuffled(e))
  widgets.playlists.addEventListener(EVENTS.DELETE_PLAYLIST, (e) => onPlaylistDelete(e))
  widgets.playlists.addEventListener(EVENTS.SELECT_TRACK, (e) => onTrackSelect(e))
  widgets.playlists.addEventListener(EVENTS.MUTE_TRACK, (e) => onMute(e))
  widgets.playlists.addEventListener(EVENTS.DELETE_TRACK, (e) => onTrackDelete(e))

  widgets.editor.addEventListener(EVENTS.EDIT_SAVE, (e) => onEdited(e))

  info.addEventListener('change', (e) => onTitle(e))
  info.addEventListener('save', (e) => onSave(e))

  widgets.metronome.addEventListener(EVENTS.PLAY, () => onPlay())
  widgets.metronome.addEventListener(EVENTS.STOP, () => onStop())
  widgets.metronome.addEventListener(EVENTS.BACK, () => onBack())
  widgets.metronome.addEventListener(EVENTS.NEXT, () => onNext())

  state.addEventListener('change', (e) => onStateModified(e))

  models.playlists.addEventListener('muted', (e) => onMuted(e, true))
  models.playlists.addEventListener('unmuted', (e) => onMuted(e, false))
  models.playlists.addEventListener('selected', (e) => onSelected(e))
  models.playlists.addEventListener('changed', (e) => onPlaylist(e))
  models.playlists.addEventListener('added', (e) => onPlaylistAdded(e))
  models.playlists.addEventListener('deleted', (e) => onPlaylistDeleted(e))

  document.addEventListener('keydown', (e) => onKeyDown(e))
}

function onKeyDown(event) {
  if (event.key === ' ') {
    const f = (el) => (el?.shadowRoot?.activeElement ? f(el.shadowRoot.activeElement) : el)
    const active = f(document.activeElement)
    const tag = `${active?.tagName}.${active?.type}`.toLowerCase()
    const ignore = ['input.text', 'input.checkbox', 'input.number']

    if (!ignore.includes(tag)) {
      event.preventDefault()
      engine.toggle()
    }
  }
}

function onTimeSignature(event) {
  const timeSignature = event.detail.timeSignature

  state.timeSignature = timeSignature
  engine.setTimeSignature(state.timeSignature)

  if (state.track === '') {
    settings.timeSignature = timeSignature
    settings.save()
  }
}

function onMM(event) {
  const pulse = event.detail?.pulse
  const BPM = event.detail?.BPM

  state.MM = { BPM, pulse }

  engine.setBPM(state.BPM)
  engine.setPulse(state.pulse)

  if (state.track === '') {
    settings.BPM = state.BPM
    settings.pulse = state.pulse
    settings.save()
  }
}

function onLoop(event) {
  state.loop = event.detail.loop

  engine.setLoop(state.loop)
}

function onKnob(save) {
  const BPM = document.querySelector('yam-knob').BPM

  state.BPM = BPM
  engine.setBPM(state.BPM)

  if (state.track === '' && save) {
    settings.BPM = state.BPM
    settings.save()
  }
}

function onWheel(save) {
  const BPM = document.querySelector('yam-wheel').BPM

  state.BPM = BPM
  engine.setBPM(state.BPM)

  if (state.track === '' && save) {
    settings.BPM = state.BPM
    settings.save()
  }
}

function onTitle(event) {
  const title = `${event.detail.title}`.trim()
  const info = document.querySelector('yam-info')

  state.title = title
  info.modified = state.modified
}

function onPlay() {
  engine.play()
}

function onStop() {
  engine.stop()
}

function onBack() {
  const UUID = state.playlist
  const playlist = models.playlists.playlist(UUID)

  if (playlist != null) {
    playlist.back()
  }
}

function onNext() {
  const UUID = state.playlist
  const playlist = models.playlists.playlist(UUID)

  if (playlist != null) {
    playlist.next()
  }
}

function onStateModified() {
  const track = models.tracks.track(state.track)

  widgets.pads.pulse = state.pulse
  widgets.pads.timeSignature = state.timeSignature

  widgets.info.title = state.title
  widgets.info.track = track
  widgets.info.modified = state.modified

  // FIXME figure out state/track conflict
  widgets.timeSignature.timeSignature = state.timeSignature
  widgets.timeSignature.locked = track != null && track.sections != null && track.sections.length > 0
  widgets.timeSignature.track = track

  // FIXME figure out state/track conflict
  widgets.mm.BPM = state.BPM
  widgets.mm.pulse = state.pulse
  widgets.mm.timeSignature = state.timeSignature
  widgets.mm.track = track

  widgets.knob.BPM = state.BPM
  widgets.wheel.BPM = state.BPM
}

function onTrackSelect(event) {
  const playlist = models.playlists.playlist(event.detail.playlist)
  const track = event.detail.track

  playlist?.select(track)
  show('metronome')
}

function onMute(event) {
  const playlist = models.playlists.playlist(event.detail.playlist)
  const track = event.detail.track
  const mute = event.detail.mute === true

  if (playlist != null) {
    if (mute) {
      playlist.mute(track)
    } else {
      playlist.unmute(track)
    }
  }
}

function onMuted(e, muted) {
  const playlist = models.playlists.playlist(event.detail.playlist)
  const track = e.detail.track

  widgets.playlists.mute(playlist, track, muted)

  playlist?.save()
}

function onSelected(event) {
  const playlist = models.playlists.playlist(event.detail.playlist)
  const track = models.tracks.track(event.detail.track)
  const toolbar = document.querySelector('toolbar')

  state.selected = {
    playlist: playlist?.UUID,
    track: track,
  }

  widgets.playlists.selected = {
    playlist: playlist?.UUID,
    track: track?.UUID,
  }

  widgets.info.track = track

  widgets.timeSignature.track = track
  widgets.mm.track = track

  widgets.loop.enabled = track?.loopable ?? false
  widgets.loop.loop = track?.loop ?? false
  widgets.loop.loops = track?.loops ?? INF

  widgets.knob.tempo = track?.tempo
  widgets.knob.BPM = track?.BPM

  widgets.metronome.bof = playlist?.BOF(track) ?? true
  widgets.metronome.eof = playlist?.EOF(track) ?? true

  widgets.editor.track = track

  engine.load(track)

  if (track == null) {
    toolbar.classList.remove('editable')
  } else {
    toolbar.classList.add('editable')
  }
}

function onPlaylistDelete(event) {
  const playlist = event.detail.playlist

  models.playlists.delete(playlist)
}

function onPlaylist(e) {
  const list = models.playlists.playlist(e.detail.playlist)
  const tracks = models.tracks.tracks

  if (list != null) {
    widgets.playlists.update(list, tracks)
  }
}

function onTrackDelete(event) {
  const playlist = event.detail.playlist
  const track = event.detail.track
  const toolbar = document.querySelector('toolbar')

  models.playlists.playlist(playlist)?.remove(track)
  models.playlists.playlist(playlist)?.save()

  if (!models.playlists.has(track)) {
    models.tracks.remove(track)
  }

  if (state.playlist === playlist && state.track === track) {
    state.selected = {
      playlist: playlist,
      track: null,
    }

    widgets.editor.track = null

    toolbar.classList.remove('editable')
  }
}

function onSave() {
  try {
    const object = {
      title: state.title,
      BPM: state.BPM,
      timeSignature: state.timeSignature,
      pulse: state.pulse,
      loop: state.loop,
    }

    let track = models.tracks.track(state.track)

    if (track == null) {
      track = models.tracks.create()

      // ... add to 'All Tracks' playlist
      const all = models.playlists.playlist(DEFAULT.UUID)

      all.add(track)
      all.save()

      // ... add to current playlist
      const playlist = models.playlists.playlist(state.playlist)
      if (playlist != null) {
        playlist.add(track)
        playlist.select(track.UUID)
        playlist.save()
      }

      widgets.playlists.tracklist = models.tracks.tracks
      widgets.editor.track = track
    }

    track.update(object)
    track.save()

    // ... update state, playlists, editor, audio engine, etc
    const playlist = models.playlists.playlist(state.playlist)

    widgets.playlists.updated(playlist, track)

    state.selected = {
      playlist: playlist?.UUID,
      track: track,
    }

    widgets.playlists.selected = {
      playlist: playlist?.UUID,
      track: track?.UUID,
    }

    widgets.editor.update(track)
    engine.setTrack(track)
  } catch (err) {
    onError(err)
  }
}

function onEdited(event) {
  try {
    const track = models.tracks.track(event.detail.track)

    if (track != null) {
      track.update({
        title: event.detail.title,
        timeSignature: event.detail.timeSignature,
        pulse: event.detail.pulse,
        tempo: event.detail.tempo,
        BPM: event.detail.BPM,
        loop: event.detail.loop,
        loops: event.detail.loops,
        sections: event.detail.sections,
      })

      track.save()

      // ... update state
      if (state.track === track.UUID) {
        state.title = track.title
        state.timeSignature = track.timeSignature
        state.pulse = track.pulse
        state.BPM = track.BPM
        state.loop = track.loop

        state.commit()

        // ... update widgets
        widgets.info.title = track.title
        widgets.info.modified = state.modified
        widgets.timeSignature.timeSignature = track.timeSignature
        widgets.mm.pulse = track.pulse
        widgets.mm.BPM = track.BPM
        widgets.loop.loop = track.loop
        widgets.knob.BPM = track.BPM
        widgets.knob.tempo = track.tempo
        widgets.wheel.BPM = track.BPM
        widgets.loop.loops = track.loops

        // ... update engine
        engine.setTrack(track)
        engine.setLoop(track.loop)
      }

      // ... update 'All Tracks' playlist
      const all = models.playlists.playlist(DEFAULT.UUID)

      if (all != null) {
        widgets.playlists.updated(all, track)
        all.save()
      }

      // ... update other playlist
      const playlist = models.playlists.playlist(state.playlist)
      if (playlist != null) {
        widgets.playlists.updated(playlist, track)
        playlist.save()
      }

      // ... update editor
      widgets.editor.update(track)
    }
  } catch (err) {
    onError(err)
  }
}

function onPlaylistsShuffled(event) {
  models.playlists.shuffled(event.detail.playlists)
}

function onPlaylistNew(_event) {
  models.playlists.create()
}

function onPlaylistChange(event) {
  const playlist = models.playlists.playlist(event.detail.playlist)

  if (playlist != null) {
    playlist.update(event.detail.title, event.detail.tracks)
    playlist.save()

    if (playlist.UUID === state.playlist) {
      widgets.metronome.bof = playlist?.BOF(state.track) ?? true
      widgets.metronome.eof = playlist?.EOF(state.track) ?? true
    }
  }
}

function onPlaylistAdded(event) {
  const UUID = event.detail.playlist
  const playlist = models.playlists.playlist(UUID)
  const tracks = models.tracks.tracks
  const muted = playlist.muted

  widgets.playlists.add(playlist, tracks, muted)

  playlist.select(null)
}

function onPlaylistSelected(event) {
  const playlist = models.playlists.playlist(event.detail.playlist)

  if (playlist?.UUID !== state.playlist) {
    playlist?.select(null)

    widgets.metronome.bof = playlist?.BOF(null) ?? true
    widgets.metronome.eof = playlist?.EOF(null) ?? true
    widgets.editor.track = null

    settings.playlist = playlist?.UUID
    settings.save()
  }
}

function onPlaylistShuffled(event) {
  models.playlists.playlist(event.detail.playlist)?.shuffled(event.detail.tracks)
}

// FIXME eeewwwwww :-(
function onPlaylistDeleted(event) {
  const playlist = models.playlists.playlist(event.detail.playlist)

  widgets.playlists.deleted(playlist)
  models.playlists.save()

  if (state.playlist === playlist.UUID) {
    state.selected = {
      playlist: null,
      track: null,
    }

    widgets.editor.track = null

    const track = models.tracks.track(state.track)

    settings.playlist = playlist?.UUID
    settings.save()

    widgets.playlists.selected = {
      playlist: playlist?.UUID,
      track: track?.UUID,
    }

    widgets.info.track = track
    widgets.timeSignature.track = track
    widgets.mm.track = track

    widgets.metronome.bof = playlist?.BOF(track) ?? true
    widgets.metronome.eof = playlist?.EOF(track) ?? true

    engine.load(track)
  }
}

function onError(err) {
  console.error(err)
}

function animate(id) {
  const playing = engine.playing()
  const stopped = engine.stopped()
  const bar = engine.bar()
  const section = engine.section()
  const beat = engine.beat()
  const beats = engine.beats()
  const divisions = engine.divisions()
  const BPM = engine.BPM()
  const pulse = engine.pulse()
  const loops = engine.loops()

  const timeSignature = state.timeSignature

  const runstate = {
    playing: playing,
    stopped: stopped,
    bar: bar,
    section: section,
    beats: beats,
    divisions: divisions,
    pulse: pulse,
    loops: loops,
  }

  widgets.pads.redraw(beat, runstate)
  widgets.info.redraw(bar, runstate)
  widgets.timeSignature.redraw(timeSignature, runstate)
  widgets.mm.redraw(runstate)
  widgets.knob.redraw(BPM, runstate)
  widgets.wheel.redraw(BPM, runstate)
  widgets.loop.redraw(runstate)

  if (!stopped) {
    requestAnimationFrame(() => animate(id))
  }
}

function warnf(err) {
  log.warnf(LOGTAG, `${err}`)
}
