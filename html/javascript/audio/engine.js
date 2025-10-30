import * as nodes from './nodes/nodes.js'
import * as sounds from './sounds.js'
import { parsePulse } from '../util.js'

const AudioContext = window.AudioContext || window.webkitAudioContext

let audioContext

class Engine {
  #ctx = null
  #metronome = null
  #gain = null
  #initialised = false

  #BPM = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #track = null
  #loop = false
  #ding = false
  #volume = 1
  #subscribers = new EventTarget()

  constructor() {}

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
        .then((metronome) => {
          metronome.BPM = this.#BPM
          metronome.timeSignature = this.#timeSignature
          metronome.pulse = this.#pulse
          metronome.loop = this.#loop
          metronome.ding = this.#ding
          metronome.track = this.#track // NB: MUST come after the standalone parameters, otherwise it gets overriden

          const gain = audioContext.createGain()

          gain.gain.value = this.#volume

          metronome.connect(gain)
          gain.connect(ctx.destination)

          this.#ctx = ctx
          this.#metronome = metronome
          this.#gain = gain
          this.#initialised = true
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

  get initialised() {
    return this.#initialised
  }

  set debug(dbg) {
    this.#exec(() => (this.#metronome.debug = dbg))
  }

  play() {
    this.#exec(() => this.#metronome.play())
  }

  stop() {
    this.#exec(() => this.#metronome.stop())
  }

  toggle() {
    this.#exec(() => this.#metronome.toggle())
  }

  set BPM(v) {
    const bpm = parseInt(`${v}`, 10)

    if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
      this.#BPM = bpm

      if (this.initialised) {
        this.#metronome.BPM = bpm
      }
    }
  }

  set timeSignature(timeSignature) {
    if (timeSignature != null) {
      this.#timeSignature = timeSignature

      if (this.initialised) {
        this.#metronome.timeSignature = timeSignature
      }
    }
  }

  set pulse(v) {
    const pulse = parsePulse(`${v}`)

    if (pulse != null) {
      this.#pulse = pulse

      if (this.initialised) {
        this.#metronome.pulse = pulse
      }
    }
  }

  set track(track) {
    this.#track = track

    if (this.initialised) {
      this.#metronome.track = track
    }
  }

  set loop(loop) {
    this.#loop = loop

    if (this.initialised) {
      this.#metronome.loop = loop
    }
  }

  set ding(ding) {
    this.#ding = ding

    if (this.initialised) {
      this.#metronome.ding = ding
    }
  }

  set volume(v) {
    if (!Number.isNaN(v) && v >= 0.0 && v <= 4) {
      this.#volume = v

      if (this.initialised) {
        this.#gain.gain.linearRampToValueAtTime(v, this.#ctx.currentTime + 0.5)
      }
    }
  }

  get playing() {
    if (this.initialised) {
      return this.#metronome.playing ?? false
    }

    return false
  }

  get stopped() {
    if (this.initialised) {
      return this.#metronome.stopped ?? false
    }

    return false
  }

  get bar() {
    if (this.initialised) {
      return this.#metronome.bar ?? 0
    }

    return 0
  }

  get beat() {
    if (this.initialised) {
      return this.#metronome.beat ?? 0
    }

    return 0
  }

  get loops() {
    if (this.initialised) {
      return this.#metronome?.loops ?? 0
    }

    return 0
  }
}

function metronome(ctx, sounds, subscribers) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/worklet.js').then(() => new nodes.MetronomeNode(ctx, sounds, subscribers))
}

export const engine = new Engine()
