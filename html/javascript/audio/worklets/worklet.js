import * as FSM from './FSM.js'
import * as level from './level.js'
import { Clock } from './clock.js'
import { State, BUFFERSIZE } from '../shared/state.js'
import { DOTTED_QUARTER } from '../shared/constants.js'

const INF = Number.POSITIVE_INFINITY

let DEBUG = false

export class Metronome extends AudioWorkletProcessor {
  #track = {
    BPM: null,
    beats: null,
    divisions: null,
    pulse: null,
    sections: [],
    loops: INF,
    delay: 0,
  }

  #section = null
  #loops = 0
  #cued = []
  #delay = 0

  constructor() {
    super()

    this.state = new State(new ArrayBuffer(BUFFERSIZE))
    this.FSM = new FSM.FSM()
    this.level = new level.Level()
    this.clicks = new Map()
    this.clock = new Clock()

    this.port.onmessage = this.onMessage.bind(this)
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
    ]
  }

  onMessage(event) {
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

      case 'track':
        this.#track = transmogrify(event.data.track)
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

    this.state = new State(event.data.state)
    this.fs = event.data.fs
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

    this.state.reset()
    this.FSM.onStart()
  }

  play() {
    if (this.FSM.onPlay()) {
      this.section = null
      this.#loops = 0
      this.clock.reset()
    }
  }

  stop() {
    if (this.FSM.onStop()) {
      this.port.postMessage({
        message: 'stopped',
      })
    }
  }

  get playing() {
    return this.FSM.playing
  }

  get delaying() {
    return this.#delay > 0
  }

  get starting() {
    return this.FSM.starting
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

  restart() {
    const playing = this.playing

    this.FSM.onStop()

    if (playing) {
      if (this.FSM.onPlay()) {
        this.section = null
        this.#loops = 0
        this.clock.reset()
      }
    }
  }

  #bpm(BPM) {
    const tempo = this.#track?.tempo ?? null
    const bpm = this.section?.BPM ?? null

    if (tempo != null && bpm != null) {
      return (bpm * BPM) / tempo
    }

    return this.section?.BPM ?? BPM
  }

  process(_inputs, outputs, parameters) {
    const N = outputs?.[0]?.[0]?.length ?? -3
    const BPM = this.#bpm(clamp(parameters.BPM[0], 40, 200))
    const tactus = this.section?.beats ?? clamp(parameters.beats[0], 1, 32)
    const figura = this.section?.divisions ?? clamp(parameters.divisions[0], 1, 32)
    const pulse = this.section?.pulse ?? parameters.pulse[0]
    const loop = parameters.loop[0]
    const gain = this.playing ? this.level.fadeIn() : this.level.fadeOut()
    let clock = this.clock

    if (this.starting) {
      clock.tick(BPM, tactus, figura, pulse, N)
      if (clock.time >= 250) {
        if (this.FSM.on250ms()) {
          clock.reset()
          this.flip(FSM.STATE.PLAYING, null, 0, 0, this.#loops, parameters)
          this.port.postMessage({
            message: 'playing',
          })

          // ... start delay?
          this.#delay = this.track?.delay ?? 0
        }
      }
    }

    if (this.playing) {
      const cluck = clock.tick(BPM, tactus, figura, pulse, N)

      if (this.delaying) {
        if (clock.time >= this.#delay) {
          this.#delay = 0
          clock.reset()
        }
      } else if (cluck.click) {
        const measure = cluck.bar
        const section = this.#track.sections.find((v) => measure >= v.start && measure <= v.end)
        const id = this.section?.ID ?? 0

        if (section != null && section.ID != id) {
          console.log({ measure }, section)
        }

        if (section != null) {
          this.section = section
        }

        if (measure > this.track.bars && this.FSM.onStop()) {
          this.#loops++

          this.FSM.onStopped()
          log('STOP', clock.t, clock.time, BPM, cluck.bar, cluck.beat, gain, tactus, figura)

          const loops = this.track?.loops ?? INF

          if (loop && (loops == INF || this.#loops < loops) && this.FSM.onPlay()) {
            this.flip(FSM.STATE.STOPPED, null, 0, 0, this.#loops, parameters)
            this.section = null
            this.clock.reset()
          } else {
            this.flip(FSM.STATE.STOPPED, null, 0, 0, 0, parameters)
            this.port.postMessage({
              message: 'stopped',
            })
          }
        } else {
          const playhead = `${cluck.bar}.${cluck.beat}`
          const dings = this.#track?.dings ?? []

          // console.log('>>>', dings, playhead, dings.includes(playhead))
          if (dings.includes(playhead)) {
            const ding = this.clicks.get('ding')
            if (ding != null) {
              this.#cued.push(sample(ding))
            }
          }

          this.cue(cluck.beat, pulse)
          this.flip(FSM.STATE.PLAYING, this.section, cluck.bar, cluck.beat, this.#loops, parameters)
          log('PLAY', clock.t, clock.time, BPM, cluck.bar, cluck.beat, tactus, figura, pulse)
        }
      }
    } else if (this.stopping) {
      this.FSM.onStopped()
      this.flip(FSM.STATE.STOPPED, null, 0, 0, 0, parameters)
      log('STOP', clock.t, clock.time, BPM, Number.NaN, Number.NaN, gain, tactus, figura)
    }

    // ... render
    if (outputs != null && outputs.length > 0 && outputs[0] != null) {
      const out = outputs[0]

      for (const v of this.#cued) {
        if (out.length > 0 && out[0] != null) {
          render(out[0], v.left, gain)
        }

        if (out.length > 1 && out[1] != null) {
          render(out[1], v.right, gain)
        }
      }

      const finished = this.#cued.some((v) => v.done())
      if (finished) {
        this.#cued = this.#cued.filter((v) => !v.done())
      }
    }

    return true
  }

  cue(beat, pulse) {
    const pattern = this.section?.clicks ?? this.#track?.clicks ?? null

    // ... count-in
    if ('count-in' === this.section?.role) {
      const clicks = this.section?.clicks ?? []

      if (clicks.length === 0) {
        const click = this.clicks.get('count-in') ?? this.clicks.get('default')

        if (click != null && (pulse !== DOTTED_QUARTER || [1, 4].includes(beat))) {
          this.#cued.push(sample(click))
        }
      } else {
        const click = this.clicks.get('count-in') ?? this.clicks.get('default')

        if (clicks.includes(beat) && click != null) {
          this.#cued.push(sample(click))
        }
      }

      return
    }

    // ... anacrusis
    if ('anacrusis' === this.section?.role) {
      const clicks = this.section?.clicks ?? []
      const key = clicks.includes(beat) ? 'default' : 'count-in'
      const click = this.clicks.get(key) ?? this.clicks.get('default')

      if (click != null) {
        this.#cued.push(sample(click))
      }

      return
    }

    // ... clicks = [1,2,...]
    if (pattern != null && Array.isArray(pattern)) {
      if (pattern.includes(beat)) {
        const click = this.clicks.get(beat) ?? this.clicks.get('default')
        if (click != null) {
          this.#cued.push(sample(click))
        }
      }

      return
    }

    // ... clicks = {1:'sticks', ...}
    if (pattern != null && pattern instanceof Map) {
      if (pattern.has(`${beat}`)) {
        const k = pattern.get(`${beat}`)
        const click = this.clicks.get(k) ?? this.clicks.get('default')
        if (click != null) {
          this.#cued.push(sample(click))
        }
      }

      return
    }

    // ... 6:8, dotted-quarter
    if (pulse === DOTTED_QUARTER) {
      if ([1, 4].includes(beat)) {
        const click = this.clicks.get(beat) ?? this.clicks.get('default')
        if (click != null) {
          this.#cued.push(sample(click))
        }
      }

      return
    }

    // ... default
    const click = this.clicks.get(beat) ?? this.clicks.get('default')
    if (click != null) {
      this.#cued.push(sample(click))
    }
  }

  flip(state, section, bar, beat, loops, parameters) {
    this.state.state = state
    this.state.section = section?.ID ?? 0
    this.state.bar = bar
    this.state.beat = beat
    this.state.loops = loops

    if (section != null) {
      this.state.beats = section?.beats ?? clamp(parameters.beats[0], 1, 32)
      this.state.divisions = section?.divisions ?? clamp(parameters.divisions[0], 0.125, 0.75)
      this.state.pulse = section?.pulse ?? this.track?.pulse
    } else {
      this.state.beats = this.track?.beats ?? clamp(parameters.beats[0], 1, 32)
      this.state.divisions = this.track?.divisions ?? clamp(parameters.divisions[0], 0.125, 0.75)
      this.state.pulse = parameters.pulse[0]
    }

    this.state.flip()
    this.port.postMessage({
      message: 'flipped',
    })
  }
}

function transmogrify(track) {
  function* augment(list) {
    let start = 0
    for (const section of list) {
      yield {
        ...section,
        start: start + 1,
        end: start + section.measures,
      }

      start += section.measures
    }
  }

  const subsections = track.sections.flatMap((section) => {
    return section.subsections.map((v) => ({
      ID: section.ID,
      role: section.role,
      ...v,
    }))
  })

  track.sections = Array.from(augment(subsections))

  return track
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

registerProcessor('metronome', Metronome)
