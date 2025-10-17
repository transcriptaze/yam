import * as PULSE from '../shared/constants.js'

export class Clock {
  #tick = -1
  #bar = 0
  #beat = 0
  #subbeat = 0
  #fs = 44100
  #buffersize = 128
  #Δt = (1000 * 128) / 44100
  #δt = 1 / 44100 // eslint-disable-line
  #last = {
    time: 0,
  }

  #debug = false

  constructor() {}

  get t() {
    return this.#tick > 0 ? this.#tick : 0
  }

  get time() {
    return this.#tick > 0 ? this.#tick * this.#Δt : 0
  }

  get bar() {
    return this.#bar
  }

  get beat() {
    return 1 + this.#beat + this.#subbeat
  }

  set fs(v) {
    const fs = Number.parseFloat(`${v}`)

    if (!Number.isNaN(fs) && fs > 0.0) {
      this.#fs = fs
      this.#Δt = (1000 * this.#buffersize) / this.#fs
      this.#δt = 1 / this.#fs
    }
  }

  set buffersize(v) {
    const N = Number.parseInt(`${v}`)

    if (!Number.isNaN(N) && N > 0) {
      this.#buffersize = N
      this.#Δt = (1000 * this.#buffersize) / this.#fs
      this.#δt = 1 / this.#fs
    }
  }

  get debug() {
    return this.#debug
  }

  set debug(v) {
    this.#debug = v === true
  }

  reset() {
    this.#tick = -1
    this.#bar = 0
    this.#beat = 0
    this.#last = {
      time: 0,
    }
  }

  tick(BPM, tactus, figura, pulse, N) {
    if (N !== this.#buffersize) {
      this.buffersize = N
    }

    this.#tick = this.#tick < 0 ? 0 : this.#tick + 1

    const click = this.click(this.t, BPM, tactus, figura, pulse)

    return {
      click: click,
      bar: this.bar,
      beat: this.beat,
    }
  }

  click(tick, BPM, tactus, figura, pulse) {
    const { interval, subinterval, clicksPerBeat } = this.interval(BPM, figura, pulse)
    const last = this.#last.time
    const start = tick * this.#Δt // ms
    const end = (tick + 1) * this.#Δt //ms

    // ... increment whole beats
    let next = last
    let beat = this.#beat
    while (next + interval < end) {
      next += interval
      beat += 1
    }

    // ... increment half beats
    let δt = 0
    let subbeat = 0
    while (next + δt + subinterval < end) {
      δt += subinterval
      subbeat += 1 / clicksPerBeat
    }

    this.#beat = (Math.round(2 * beat) / 2) % tactus
    this.#subbeat = Math.round(2 * subbeat) / 2

    if (start <= next + δt && next + δt < end) {
      this.#last.time = next

      if (this.#beat === 0 && this.#subbeat === 0) {
        this.#bar += 1
      }
    }

    // ... click
    if (start <= next + δt && next + δt < end) {
      return true
    }

    return false
  }

  interval(BPM, figura, pulse) {
    const subdivisions = PULSE.pulseFromInt(pulse)?.interval ?? 0.25
    const clicksPerBeat = min(1 / subdivisions / figura, 1)
    const interval = (60 * 1000) / BPM
    const subinterval = interval / clicksPerBeat

    if (pulse == PULSE.DOTTED_QUARTER) {
      const base = 1 / figura
      const N = subdivisions / base

      return {
        interval: interval / N,
        subinterval: interval / N,
        clicksPerBeat: clicksPerBeat,
      }
    }

    return { interval, subinterval, clicksPerBeat }
  }
}

function min(v, minimum) {
  return v < minimum ? minimum : v
}
