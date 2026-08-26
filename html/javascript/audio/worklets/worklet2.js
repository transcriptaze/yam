import * as FSM from './FSM.js'
import * as level from './level.js'
import { Clock } from './clock.js'

import { VM } from '../vm/vm.js'
import { OPCODES, SUBDIVISIONS, int2subdivisions } from '../vm/constants.js'

const INF = Number.POSITIVE_INFINITY
const START_DELAY = 250

let DEBUG = false

export class Metronome2 extends AudioWorkletProcessor {
  #track = {
    BPM: null,
    beats: null,
    divisions: null,
    pulse: null,
    sections: [],
    loops: INF,
    delay: 0,
  }

  #time = 0

  #script = {
    delay: 0,
    script: [],
  }

  #vm = new VM(sampleRate, [])

  #section = null
  #loops = 0
  #cued = []
  #samples = 0

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
      {
        name: 'beats',
        defaultValue: 4,
        minValue: 1,
        maxValue: 32,
        automationRate: 'k-rate',
      },
      {
        name: 'divisions',
        defaultValue: 4,
        minValue: 1,
        maxValue: 32,
        automationRate: 'k-rate',
      },
      {
        name: 'pulse',
        defaultValue: 3,
        minValue: 1,
        maxValue: 6,
        automationRate: 'k-rate',
      },
      {
        name: 'loop',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate',
      },
      {
        name: 'ding',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate',
      },
    ]
  }

  #onMessage(event) {
    switch (event.data.message) {
      case 'initialise':
        this.initialise(event)
        break

      case 'clear':
        this.stop()
        this.#track = {
          BPM: null,
          beats: null,
          divisions: null,
          pulse: null,
          sections: [],
          loops: INF,
          delay: 0,
        }

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
    const sticks = event.data.stick
    const ding = event.data.ding

    this.clock.fs = event.data.fs
    this.level.sampleRate = event.data.fs
    this.clicks = new Map([
      ['default', tock],
      ['count-in', sticks],
      ['tick', tick],
      ['tock', tock],
      ['tack', tack],
      ['sticks', sticks],
      ['ding', ding],
      [1, tick],
      [2, tock],
      [3, tock],
      [4, tock],
    ])

    this.FSM.onStart()
  }

  play() {
    if (this.FSM.onPlay()) {
      this.section = null
      this.samples = 0
      this.clock.reset()

      this.#time = 0
      this.#vm = new VM(sampleRate, this.#script.script)

      console.log({ sampleRate })
      console.log(this.#script)
      console.log(this.#vm)

      this.port.postMessage({
        message: 'ready',
        track: this.#track?.UUID ?? '',
      })
    }
  }

  stop() {
    if (this.FSM.onStop()) {
      this.port.postMessage({
        message: 'stopped',
        track: this.#track?.UUID ?? '',
        loops: this.#loops,
        bars: this.#track,
      })

      this.port.postMessage({
        message: 'done',
        track: this.#track?.UUID ?? '',
      })

      this.flip({ state: FSM.STATE.STOPPED, bar: 0, beat: 0, loops: this.#loops })
    }
  }

  restart() {
    const playing = this.playing

    this.FSM.onStop()
    this.#time = 0
    this.#loops = 0 // NTS: always reset loop count on loading a track
    this.#samples = 0

    if (playing) {
      if (this.FSM.onPlay()) {
        this.section = null
        this.clock.reset()
        this.#vm = new VM(sampleRate, this.#script.script)
      }
    }
  }

  get playing() {
    return this.FSM.playing
  }

  get stopping() {
    return this.FSM.stopping
  }

  get stopped() {
    return this.FSM.stopped
  }

  get track() {
    return this.#track
  }

  get section() {
    return this.#section
  }

  set section(v) {
    this.#section = v
  }

  #bpm(BPM) {
    const tempo = this.#track?.tempo ?? null
    const bpm = this.section?.tempo ?? null

    if (tempo != null && bpm != null) {
      return (bpm * BPM) / tempo
    }

    return this.section?.tempo ?? BPM
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

    const finished = this.#cued.some((v) => v.done())
    if (finished) {
      this.#cued = this.#cued.filter((v) => !v.done())
    }

    // ... done
    this.#time = end

    return true
  }

  #process(t, outputs, parameters) {
    const N = outputs?.[0]?.[0]?.length ?? -3 // FIXME should be 0 probably
    const BPM = this.#bpm(clamp(parameters.BPM[0], 40, 200))
    const tactus = this.section?.beats ?? clamp(parameters.beats[0], 1, 32)
    const figura = this.section?.divisions ?? clamp(parameters.divisions[0], 1, 32)
    const pulse = this.section?.pulse ?? parameters.pulse[0]

    const ding = parameters.ding[0] === 1.0
    const loop = parameters.loop[0] === 1.0
    let clock = this.clock

    this.#samples += N > 0 ? N : 0

    // ... 250ms pre-start delay
    if (this.FSM.starting) {
      if (t < START_DELAY) {
        return
      }

      this.FSM.playing = true
      this.flip({ state: FSM.STATE.PLAYING, bar: 0, beat: 0, loops: this.#loops })
      this.port.postMessage({
        message: 'playing',
        track: this.#track?.UUID ?? '',
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
      // *** KLOCK ***
      {
        const { _time, click } = this.#vm.tick(BPM, N)

        if (click != null) {
          const beats = tactus
          const divisions = figura
          const subdivisions = int2subdivisions(pulse) ?? SUBDIVISIONS.QUARTER_NOTES

          const { measure, beat } = this.#vm.click(click, { beats, divisions }, subdivisions)
          const ops = this.#vm.exec({ measure, beat }, { beats, divisions }, subdivisions, ding)

          for (const op of ops) {
            this.#exec(op, { measure, beat })
          }
        }
      }
      // *** END KLOCK ***

      const cluck = clock.tick(BPM, tactus, figura, pulse, N)

      if (cluck.click) {
        const measure = cluck.bar
        const section = this.#track.sections.find((v) => measure >= v.start && measure <= v.end)

        if (section != null) {
          this.section = section
        }

        if (measure > this.track.bars && this.FSM.onStop()) {
          this.#loops++

          const loops = this.track?.loops ?? INF

          if (loop && (loops == INF || this.#loops < loops) && this.FSM.onPlay()) {
            this.flip({ state: FSM.STATE.STOPPED, bar: 0, beat: 0, loops: this.#loops })
            this.section = null
            this.clock.reset()
          }
        } else {
          const playhead = `${cluck.bar}.${cluck.beat}`
          const dings = this.#track?.dings ?? []

          if (ding && dings.includes(playhead)) {
            const ting = this.clicks.get('ding')
            if (ting != null) {
              this.#cued.push(sample(ting))
            }
          }

          log('PLAY', clock.t, clock.time, BPM, cluck.bar, cluck.beat, tactus, figura, pulse)
        }
      } else if (cluck.tock.click) {
        // FIXME REMOVE half-assed fix for https://github.com/transcriptaze/yam/issues/45
        // const measure = cluck.bar
        // const section = this.#track.sections.find((v) => measure >= v.start && measure <= v.end)
        // const clicks = section?.clicks ?? []
        //
        // if (Array.isArray(clicks) && clicks.includes(cluck.tock.beat)) {
        //   this.cue(cluck.tock.beat, pulse)
        // } else if (clicks instanceof Map && clicks.has(cluck.tock.beat)) {
        //   this.cue(cluck.tock.beat, pulse)
        // }
      }
    }
  }

  #exec(opcode, { measure, beat }) {
    const cue = (v) => {
      const click = this.clicks.get(v) ?? this.clicks.get('default')
      if (click != null) {
        this.#cued.push(sample(click))
      }

      this.flip({ state: FSM.STATE.PLAYING, bar: measure, beat: beat, loops: this.#loops })
    }

    const stop = () => {
      this.FSM.onStop()
      this.FSM.onStopped()

      this.port.postMessage({
        message: 'stopped',
        track: this.#track?.UUID ?? '',
        loops: this.#loops, // NTS: send current loops - doesn't reset loop count on stop anymore
        samples: this.#samples,
        duration: this.#samples / sampleRate,
      })

      // this.#loops = 0 // NTS: done, reset loop count
      //
      // this.port.postMessage({
      //   message: 'done',
      //   track: this.#track?.UUID ?? '',
      // })

      this.flip({ state: FSM.STATE.STOPPED, bar: 0, beat: 0, loops: 0 })
    }

    switch (opcode) {
      case OPCODES.TICK:
        cue('tick')
        break

      case OPCODES.TOCK:
        cue('tock')
        break

      case OPCODES.TACK:
        cue('tack')
        break

      case OPCODES.STICKS:
        cue('sticks')
        break

      case OPCODES.DING:
        cue('ding')
        break

      case OPCODES.STOP:
        stop()
        break
    }
  }

  flip({ state, bar, beat, loops }) {
    this.port.postMessage({
      message: 'flipped',

      track: this.#track?.UUID ?? '',
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

function log(tag, tick, time, bpm, bar, beat, tactus, figura, pulsus) {
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
