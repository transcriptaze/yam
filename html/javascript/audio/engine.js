import * as nodes from './nodes/nodes.js'
import * as soundsets from './soundsets.js'
import { parsePulse } from '../util.js'
import { EVENTS } from '../constants.js'

const AudioContext = window.AudioContext || window.webkitAudioContext

let audioContext

class Engine {
  #ctx = null
  #metronome = null
  #gain = null
  #recorder = null
  #initialised = false
  #armed = false

  #BPM = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #track = null
  #loop = false
  #ding = false
  #volume = 1
  #soundset = 'default'

  #subscribers = new EventTarget()

  constructor() {}

  #init(ctx) {
    if (this.initialised) {
      return Promise.resolve()
    } else {
      return soundsets
        .get(ctx, this.#soundset)
        .then((sounds) => metronome(ctx, sounds, this.#subscribers))
        .then((metronome) => {
          metronome.track = this.#track

          // NTS: expects set::track to also set pulse, BPM, loop and ding
          metronome.timeSignature = this.#timeSignature
          metronome.pulse = this.#pulse
          metronome.BPM = this.#BPM
          metronome.loop = this.#loop
          metronome.ding = this.#ding

          // ... recorder
          const stream = ctx.createMediaStreamDestination()
          const recorder = new MediaRecorder(stream.stream)

          recorder.addEventListener('start', () => {
            console.log('START')
            this.#subscribers.dispatchEvent(new CustomEvent(EVENTS.RECORDING, { detail: { state: 'recording' } }))
          })

          recorder.addEventListener('stop', () => {
            console.log('STOP')
            this.#subscribers.dispatchEvent(new CustomEvent(EVENTS.RECORDING, { detail: { state: 'stop' } }))
          })

          recorder.addEventListener('dataavailable', (e) => {
            console.log('ON-DATA-AVAILABLE')
            if (this.#armed) {
              this.#subscribers.dispatchEvent(new CustomEvent(EVENTS.RECORDING, { detail: { state: 'done', audio: e.data } }))
            }
          })

          recorder.addEventListener('error', (e) => {
            console.error('recorder', e)
          })

          this.#subscribers.addEventListener(EVENTS.STOPPED, () => recorder.stop(), false)

          // ... volume
          const gain = audioContext.createGain()

          gain.gain.value = this.#volume

          metronome.connect(gain)
          gain.connect(ctx.destination)
          gain.connect(stream)

          this.#ctx = ctx
          this.#metronome = metronome
          this.#gain = gain
          this.#recorder = recorder
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
    this.#exec(() => {
      if (this.#armed) {
        this.#recorder.start()
      }

      this.#metronome.play()
    })
  }

  stop() {
    this.#exec(() => {
      this.#metronome.stop()

      if (this.#armed) {
        this.#recorder.stop()
      }
    })
  }

  toggle() {
    this.#exec(() => {
      if (this.#armed && !this.#metronome.playing) {
        this.#recorder.start()
      }

      this.#metronome.toggle()
    })
  }

  record(armed) {
    if (!this.#armed && armed === true) {
      this.#exec(() => {
        this.#armed = true

        if (this.playing) {
          this.#recorder.start()
        }
      })
    }

    if (this.#armed && armed === false) {
      this.#exec(() => {
        this.#recorder.stop()
        this.#armed = false
      })
    }
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

    if (track != null) {
      this.timeSignature = track.timeSignature
      this.pulse = track.pulse
      this.BPM = track.BPM
      this.loop = track.loop
      this.ding = track.ding
    }

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

  set soundset(v) {
    this.#soundset = v == null ? 'default' : `${v}`
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
