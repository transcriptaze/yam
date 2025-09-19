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

  #init(ctx) {
    if (this.initialised) {
      return Promise.resolve()
    } else {
      return sounds
        .get(ctx, ...SOUNDS)
        .then(([tick, tock, stick]) => metronome(ctx, tick, tock, stick))
        .then((m) => this.init(ctx, m))
    }
  }

  #exec(f) {
    audioContext ??= new AudioContext()

    return audioContext
      .resume()
      .then(() => this.#init(audioContext))
      .then(() => f())
      .catch((err) => console.error(err))
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
    this.#exec(() => this.metronome.play())
  }

  stop() {
    this.#exec(() => this.metronome.stop())
  }

  toggle() {
    this.#exec(() => this.metronome.toggle())
  }

  get BPM() {
    if (this.initialised) {
      return this.metronome?.BPM ?? 120
    }

    return 120
  }

  set BPM(bpm) {
    this.metronome.BPM = bpm
  }

  set timeSignature(signature) {
    this.metronome.timeSignature = signature
  }

  get pulse() {
    if (this.initialised) {
      return this.metronome?.pulse ?? 'quarter'
    }

    return 'quarter'
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
    if (this.initialised) {
      return this.metronome.playing ?? false
    }

    return false
  }

  get stopped() {
    if (this.initialised) {
      return this.metronome.stopped ?? false
    }

    return false
  }

  get section() {
    if (this.initialised) {
      return this.metronome.section ?? ''
    }

    return ''
  }

  get bar() {
    if (this.initialised) {
      return this.metronome.bar ?? 0
    }

    return 0
  }

  get beat() {
    if (this.initialised) {
      return this.metronome.beat ?? 0
    }

    return 0
  }

  get beats() {
    if (this.initialised) {
      return this.metronome.beats ?? 0
    }

    return 0
  }

  get divisions() {
    if (this.initialised) {
      return this.metronome.divisions ?? 0
    }

    return 0
  }

  get loops() {
    if (this.initialised) {
      return this.metronome?.loops ?? 0
    }

    return 0
  }
}

const engine = new Engine()

export function playing() {
  return engine.playing
}

export function stopped() {
  return engine.stopped
}

export function section() {
  return engine.section
}

export function bar() {
  return engine.bar
}

export function beat() {
  return engine.beat
}

export function beats() {
  return engine.beats
}

export function divisions() {
  return engine.divisions
}

export function BPM() {
  return engine.BPM
}

export function pulse() {
  return engine.pulse
}

export function loops() {
  return engine.loops
}

export function debug(dbg) {
  Engine.DEBUG = dbg

  if (engine.initialised) {
    exec((e) => (e.debug = dbg))
  }
}

export function load(track) {
  if (track != null) {
    setBPM(track.BPM)
    setTimeSignature(track.timeSignature)
    setPulse(track.pulse)
  }

  setTrack(track)
}

export function setBPM(v) {
  const bpm = parseInt(`${v}`, 10)

  if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
    Engine.BPM = bpm
    if (engine.initialised) {
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

    if (engine.initialised) {
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
    if (engine.initialised) {
      exec((e) => (e.pulse = pulse))
    }
  }
}

export function setTrack(track) {
  Engine.track = track
  if (engine.initialised) {
    exec((e) => (e.track = track))
  }
}

// NTS: loop set for a track and can only be enabled/disabled after the track has been loaded
//      i.e. no point adding to the metronome initialisation
export function setLoop(v) {
  const loop = v === true

  if (engine.initialised) {
    exec((e) => (e.loop = loop))
  }
}

export function play() {
  engine.play()
}

export function stop() {
  engine.stop()
}

export function toggle() {
  engine.toggle()
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

export function addEventListener(event, f, options) {
  subscribers.addEventListener(event, f, options)
}

export function removeEventListener(event, f, options) {
  subscribers.removeEventListener(event, f, options)
}
