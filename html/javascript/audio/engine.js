import * as nodes from './nodes/nodes.js'
import * as sounds from './sounds.js'
import { parsePulse } from '../util.js'

const AudioContext = window.AudioContext || window.webkitAudioContext

let audioContext
class Engine {
  #metronome = null
  #initialised = false

  #BPM = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #track = null
  #loop = false
  #ding = false
  #subscribers = new EventTarget()

  constructor() {}

  init(ctx, metronome) {
    metronome.BPM = this.#BPM
    metronome.timeSignature = this.#timeSignature
    metronome.pulse = this.#pulse
    metronome.track = this.#track
    metronome.loop = this.#loop
    metronome.ding = this.#ding

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
        .get(ctx)
        .then(([tick, tock, tack, stick, ding]) => {
          const sounds = {
            tick: tick,
            tock: tock,
            tack: tack,
            stick: stick,
            ding: ding,
          }

          return metronome(ctx, sounds, this.#subscribers)
        })
        .then((m) => {
          this.init(ctx, m)
        })
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

  addEventListener(event, f, options) {
    this.#subscribers.addEventListener(event, f, options)
  }

  removeEventListener(event, f, options) {
    this.#subscribers.removeEventListener(event, f, options)
  }

  get metronome() {
    return this.#metronome
  }

  get initialised() {
    return this.#initialised
  }

  set debug(dbg) {
    this.#exec(() => (this.metronome.debug = dbg))
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

  set BPM(v) {
    const bpm = parseInt(`${v}`, 10)

    if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
      this.#BPM = bpm

      if (this.initialised) {
        this.metronome.BPM = bpm
      }
    }
  }

  set timeSignature(timeSignature) {
    if (timeSignature != null) {
      this.#timeSignature = timeSignature

      if (this.initialised) {
        this.metronome.timeSignature = timeSignature
      }
    }
  }

  set pulse(v) {
    const pulse = parsePulse(`${v}`)

    if (pulse != null) {
      this.#pulse = pulse

      if (this.initialised) {
        this.metronome.pulse = pulse
      }
    }
  }

  set track(track) {
    this.#track = track

    if (this.initialised) {
      this.metronome.track = track
    }
  }

  set loop(loop) {
    this.#loop = loop

    if (this.initialised) {
      this.metronome.loop = loop
    }
  }

  set ding(ding) {
    this.#ding = ding

    if (this.initialised) {
      this.metronome.ding = ding
    }
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

export function loops() {
  return engine.loops
}

export function debug(debug) {
  engine.debug = debug
}

export function load(track) {
  engine.track = track
}

export function setBPM(BPM) {
  engine.BPM = BPM
}

export function setTimeSignature(timeSignature) {
  engine.timeSignature = timeSignature
}

export function setPulse(pulse) {
  engine.pulse = pulse
}

// NTS: 'loop' for a track and can only be enabled/disabled after the track has been loaded
//      i.e. no point adding to the metronome initialisation
export function setLoop(v) {
  engine.loop = v === true
}

// NTS: 'ding' for a track and can only be enabled/disabled after the track has been loaded
//      i.e. no point adding to the metronome initialisation
export function setDing(v) {
  engine.ding = v === true
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

export function addEventListener(event, f, options) {
  engine.addEventListener(event, f, options)
}

export function removeEventListener(event, f, options) {
  engine.removeEventListener(event, f, options)
}

function metronome(ctx, sounds, subscribers) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/worklet.js').then(() => new nodes.MetronomeNode(ctx, sounds, subscribers))
}
