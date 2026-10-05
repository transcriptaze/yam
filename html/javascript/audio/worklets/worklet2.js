import * as FSM from './FSM.js'
import * as level from './level.js'
import { STATE } from './FSM.js'
import { Clock } from './clock.js'

import { VM } from '../vm/vm.js'
import { OPCODES, SUBDIVISIONS } from '../vm/constants.js'

const START_DELAY = 250
let DEBUG = false

export class Metronome2 extends AudioWorkletProcessor {
  #time = 0

  #script = {
    tempo: null,
    delay: 0,
    loops: Number.POSITIVE_INFINITY,
    script: [],
  }

  #vm = new VM(sampleRate, [])
  #tempo = null
  #timeSignature = null
  #subdivisions = null

  #loops = 0
  #cued = []
  #samples = 0

  #parameters = {
    beats: null,
    divisions: null,
    subdivisions: null,
    loop: false,
    ding: false,
  }

  constructor(_options) {
    super()

    this.FSM = new FSM.FSM()
    this.level = new level.Level()
    this.clicks = new Map()
    this.clock = new Clock()

    this.port.onmessage = (event) => this.#onMessage(event)
  }

  static get parameterDescriptors() {
    return [
      {
        name: 'BPM',
        defaultValue: 120,
        minValue: 40,
        maxValue: 240,
        automationRate: 'k-rate',
      },
    ]
  }

  #onMessage(event) {
    switch (event.data.message) {
      case 'initialise':
        this.initialise(event)
        break

      case 'play':
        this.play()
        break

      case 'stop':
        this.stop()
        break

      case 'toggle':
        if (this.playing) {
          this.stop()
        } else {
          this.play()
        }
        break

      case 'time-signature':
        this.#parameters.beats = event.data.beats
        this.#parameters.divisions = event.data.divisions
        break

      case 'subdivisions':
        this.#parameters.subdivisions = event.data.subdivisions
        break

      case 'loop':
        this.#parameters.loop = event.data.loop === true
        break

      case 'ding':
        this.#parameters.ding = event.data.ding === true
        break

      case 'script':
        this.#script = event.data.script
        this.restart()
        break

      case 'debug':
        DEBUG = event.data.debug === true
        this.clock.debug = event.data.debug === true
        break
    }
  }

  initialise(event) {
    const tick = event.data.tick
    const tock = event.data.tock
    const tack = event.data.tack
    const sticks = event.data.sticks
    const ding = event.data.ding
    const skip = event.data.skip

    this.clock.fs = event.data.fs
    this.level.sampleRate = event.data.fs
    this.clicks = new Map([
      ['default', tock],
      ['tick', tick],
      ['tock', tock],
      ['tack', tack],
      ['sticks', sticks],
      ['ding', ding],
      ['skip', skip],
      [1, tick],
      [2, tock],
      [3, tock],
      [4, tock],
    ])

    this.FSM.state = STATE.STOPPED
  }

  play() {
    if (this.FSM.onPlay()) {
      this.samples = 0
      this.clock.reset()

      this.#time = 0
      this.#tempo = null
      this.#timeSignature = null
      this.#subdivisions = null
      this.#loops = 0
      this.#vm = new VM(sampleRate, this.#script.script)

      this.port.postMessage({
        message: 'ready',
        track: this.#script?.UUID ?? '',
      })
    }
  }

  stop() {
    if (this.FSM.onStop()) {
      this.port.postMessage({
        message: 'stopped',
        track: this.#script?.UUID ?? '',
        loops: this.#loops,
      })

      this.port.postMessage({
        message: 'done',
        track: this.#script?.UUID ?? '',
      })

      this.flip({ state: STATE.STOPPED, bar: 0, beat: 0, loops: this.#loops })
    }
  }

  restart() {
    const playing = this.playing

    this.FSM.onStop()
    this.#time = 0
    this.#loops = 0
    this.#samples = 0

    if (playing) {
      if (this.FSM.onPlay()) {
        this.clock.reset()

        this.#tempo = null
        this.#timeSignature = null
        this.#subdivisions = null
        this.#vm = new VM(sampleRate, this.#script.script)
      }
    }
  }

  get playing() {
    return this.FSM.state === STATE.PLAYING
  }

  #bpm(BPM) {
    const tempo = this.#script?.tempo ?? null
    const bpm = this.#tempo ?? null

    if (tempo != null && bpm != null) {
      return (bpm * BPM) / tempo
    }

    return this.#tempo ?? BPM
  }

  process(_inputs, outputs, parameters) {
    const N = outputs?.[0]?.[0]?.length ?? 0
    const gain = this.playing ? this.level.fadeIn() : this.level.fadeOut()

    // ... internal clock
    const dt = (N * 1000) / sampleRate
    const start = this.#time
    const end = start + dt

    this.#process(start, outputs, parameters)

    // ... render
    for (const out of outputs) {
      for (const v of this.#cued) {
        if (out.length > 0) {
          render(out[0], v.left, gain)
        }

        if (out.length > 1) {
          render(out[1], v.right, gain)
        }
      }

      // FIXME render logic is only designed for one output
      break
    }

    const completed = this.#cued.some((v) => v.done())
    if (completed) {
      this.#cued = this.#cued.filter((v) => !v.done())
    }

    // ... loop?
    if (this.FSM.state === STATE.STOPPED && this.#cued.length == 0 && this.#parameters.loop && this.#loops < this.#script.loops) {
      this.#time = 0
      this.#vm.reset()
      this.FSM.onPlay()
    } else {
      this.#time = end
    }

    return true
  }

  #process(t, outputs, parameters) {
    const N = outputs?.[0]?.[0]?.length ?? -3 // FIXME should be 0 probably
    const BPM = this.#bpm(clamp(parameters.BPM[0], 40, 200))
    const beats = this.#timeSignature?.beats ?? this.#parameters.beats ?? 4
    const divisions = this.#timeSignature?.divisions ?? this.#parameters.divisions ?? 4
    const subdivisions = this.#subdivisions ?? this.#parameters.subdivisions ?? SUBDIVISIONS.QUARTER_NOTES

    this.#samples += N > 0 ? N : 0

    // ... 250ms pre-start delay
    if (this.FSM.state === STATE.STARTING) {
      if (t < START_DELAY) {
        return
      }

      this.FSM.state = STATE.PLAYING
      this.flip({ state: STATE.PLAYING, bar: 0, beat: 0, loops: this.#loops })
      this.port.postMessage({
        message: 'playing',
        track: this.#script?.UUID ?? '',
        loops: this.#loops,
        BPM: Math.round(clamp(parameters.BPM[0], 40, 200)),
      })
    }

    // ... track delay
    if (t < START_DELAY + this.#script.delay) {
      return
    }

    // ... play
    if (this.playing) {
      const { _time, click } = this.#vm.tick(BPM, N, { beats, divisions }, subdivisions)

      if (click != null) {
        const context = {
          subdivisions: subdivisions,
          ding: this.#parameters.ding,
        }

        const { measure, beat } = this.#vm.click(click, { beats, divisions }, subdivisions)
        const ops = this.#vm.exec({ measure, beat }, { beats, divisions }, context)

        for (const op of ops) {
          this.#exec(op, { measure, beat })
        }
      }
    }
  }

  #exec(opcode, { measure, beat }) {
    const stop = () => {
      this.FSM.onStop()
      this.FSM.onStopped()

      this.#loops++

      this.port.postMessage({
        message: 'stopped',
        track: this.#script?.UUID ?? '',
        loops: this.#loops,
        samples: this.#samples,
        duration: this.#samples / sampleRate,
      })

      this.port.postMessage({
        message: 'done',
        track: this.#script?.UUID ?? '',
      })

      this.flip({ state: STATE.STOPPED, bar: 0, beat: 0, loops: 0 })
    }

    const cue = () => {
      const click = this.clicks.get(opcode.sample) ?? this.clicks.get('default')
      if (click != null) {
        this.#cued.push(sample(click))
      }

      this.flip({ state: STATE.PLAYING, bar: measure, beat: beat, loops: this.#loops })
    }

    const tempo = () => {
      this.#tempo = opcode.tempo
    }

    const timeSignature = () => {
      this.#timeSignature = opcode.timeSignature
    }

    const subdivisions = () => {
      this.#subdivisions = opcode.subdivisions
    }

    switch (opcode.opcode) {
      case OPCODES.STOP:
        stop()
        break

      case OPCODES.PLAY:
        cue()
        break

      case OPCODES.TEMPO:
        tempo()
        break

      case OPCODES.TIME_SIGNATURE:
        timeSignature()
        break

      case OPCODES.SUBDIVISIONS:
        subdivisions()
        break
    }
  }

  flip({ state, bar, beat, loops }) {
    this.port.postMessage({
      message: 'flipped',

      track: this.#script?.UUID ?? '',
      state: state,
      bar: bar,
      beat: beat,
      loops: loops,
    })
  }
}

function render(out, click, gain) {
  const remaining = click.buffer.length - click.index
  const N = out.length < remaining ? out.length : remaining

  for (let ix = 0; ix < N; ix++) {
    out[ix] += gain * click.buffer[click.index++]
  }
}

function sample(object) {
  return {
    left: {
      buffer: object.left,
      index: 0,
    },

    right: {
      buffer: object.right,
      index: 0,
    },

    done() {
      const l = this.left.buffer.length > this.left.index
      const r = this.right.buffer.length > this.right.index

      return !l && !r
    },
  }
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function _log(tag, tick, time, bpm, bar, beat, tactus, figura, pulsus) {
  if (DEBUG) {
    let msg = `>> ${tag}`

    msg += `  TICK:${tick.toFixed(0)}`
    msg += `  TIME:${time.toFixed(0)}`
    msg += `  BAR:${bar}`
    msg += `  BEAT:${beat}`
    msg += `  BPM: ${pulsus} @ ${bpm.toFixed(0)}, ${tactus}/${figura}`

    console.log(msg)
  }
}

registerProcessor('metronome2', Metronome2)
