import * as nodes from './nodes/nodes.js'
import * as sounds from './sounds.js'
import { parseTimeSignature, parsePulse } from '../util.js'

const AudioContext = window.AudioContext || window.webkitAudioContext
const SOUNDS = ['default/tick', 'default/tock', 'default/stick']

let audioContext
let subscribers = new EventTarget()

class Engine {
  static DEBUG = false
  static BPM = 120
  static pulse = 'quarter'
  static timeSignature = { beats: 4, divisions: 4 }
  static track = null

  #metronome = null
  #initialised = false

  constructor() {}

  init(ctx, metronome) {
    metronome.debug = Engine.DEBUG
    metronome.BPM = Engine.BPM
    metronome.timeSignature = Engine.timeSignature
    metronome.pulse = Engine.pulse
    metronome.track = Engine.track

    metronome.connect(ctx.destination)

    this.#metronome = metronome
    this.#initialised = true

    return this
  }

  get metronome() {
    return this.#metronome
  }

  get initialised() {
    return this.#initialised
  }

  set debug(dbg) {
    this.metronome.debug = dbg
  }

  play() {
    this.metronome.play()
  }

  stop() {
    this.metronome.stop()
  }

  toggle() {
    this.metronome.toggle()
  }

  get BPM() {
    return this.metronome?.BPM ?? 120
  }

  set BPM(bpm) {
    this.metronome.BPM = bpm
  }

  get timeSignature() {
    return this.metronome?.timeSignature ?? '4:4'
  }

  set timeSignature(signature) {
    this.metronome.timeSignature = signature
  }

  get pulse() {
    return this.metronome?.pulse ?? 'quarter'
  }

  set pulse(pulse) {
    this.metronome.pulse = pulse
  }

  set track(track) {
    this.metronome.track = track
  }

  set loop(loop) {
    this.metronome.loop = loop
  }

  get playing() {
    return this.metronome.playing ?? false
  }

  get stopped() {
    return this.metronome.stopped ?? false
  }

  get section() {
    return this.metronome.section ?? ''
  }

  get bar() {
    return this.metronome.bar ?? 0
  }

  get beat() {
    return this.metronome.beat ?? 0
  }

  get beats() {
    return this.metronome.beats ?? 0
  }

  get divisions() {
    return this.metronome.divisions ?? 0
  }
}

const engine = new Engine()

export function playing() {
  return engine != null && engine.initialised ? engine.playing : false
}

export function stopped() {
  return engine != null && engine.initialised ? engine.stopped : false
}

export function section() {
  return engine != null && engine.initialised ? engine.section : ''
}

export function bar() {
  return engine != null && engine.initialised ? engine.bar : 0
}

export function beat() {
  return engine != null && engine.initialised ? engine.beat : 0
}

export function beats() {
  return engine != null && engine.initialised ? engine.beats : 0
}

export function divisions() {
  return engine != null && engine.initialised ? engine.divisions : 0
}

export function BPM() {
  return engine != null && engine.initialised ? engine.BPM : 120
}

export function timeSignature() {
  return engine != null && engine.initialised ? engine.timeSignature : '4:4'
}

export function pulse() {
  return engine != null && engine.initialised ? engine.pulse : 'quarter'
}

export function load(track) {
  if (track != null) {
    setBPM(track.BPM)
    setTimeSignature(track.timeSignature)
    setPulse(track.pulse)
  }

  setTrack(track)
}

export function debug(dbg) {
  Engine.DEBUG = dbg
  if (engine != null && engine.initialised) {
    exec((e) => (e.debug = dbg))
  }
}

export function setBPM(v) {
  const bpm = parseInt(`${v}`, 10)

  if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
    Engine.BPM = bpm
    if (engine != null && engine.initialised) {
      exec((e) => (e.BPM = bpm))
    }
  }
}

export function setTimeSignature(v) {
  const { beats, divisions } = parseTimeSignature(`${v}`)

  if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
    Engine.timeSignature = {
      beats: beats,
      divisions: divisions,
    }

    if (engine != null && engine.initialised) {
      exec(
        (e) =>
          (e.timeSignature = {
            beats: beats,
            divisions: divisions,
          }),
      )
    }
  }
}

export function setPulse(v) {
  const pulse = parsePulse(`${v}`)

  if (pulse != null) {
    Engine.pulse = pulse
    if (engine != null && engine.initialised) {
      exec((e) => (e.pulse = pulse))
    }
  }
}

export function setTrack(track) {
  Engine.track = track
  if (engine != null && engine.initialised) {
    exec((e) => (e.track = track))
  }
}

// NTS: loop set for a track and can only be enabled/disabled after the track has been loaded
//      i.e. no point adding to the metronome initialisation
export function setLoop(v) {
  const loop = v === true

  if (engine != null && engine.initialised) {
    exec((e) => (e.loop = loop))
  }
}

export function play() {
  exec((e) => e.play())
}

export function stop() {
  exec((e) => e.stop())
}

export function toggle() {
  exec((e) => e.toggle())
}

function exec(f) {
  audioContext ??= new AudioContext()

  return audioContext
    .resume()
    .then(() => {
      if (engine.initialised) {
        return engine
      } else {
        return sounds
          .get(audioContext, ...SOUNDS)
          .then(([tick, tock, stick]) => metronome(audioContext, tick, tock, stick))
          .then((m) => engine.init(audioContext, m))
      }
    })
    .then((engine) => f(engine))
    .catch(console.error)
}

function metronome(ctx, tick, tock, stick) {
  return ctx.audioWorklet
    .addModule('./javascript/audio/worklets/worklet.js')
    .then(() => new nodes.MetronomeNode(ctx, tick, tock, stick, subscribers))
}

export function subscribe(l) {
  if (l != null) {
    subscribers.addEventListener('playing', (e) => l.onPlaying(e), false)
    subscribers.addEventListener('stopped', (e) => l.onStopped(e), false)
  }
}
