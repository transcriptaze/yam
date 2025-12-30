export class Klock {
  #fs = 44100
  #buffersize = 128
  #Δt = (1000 * 128) / 44100

  #tick = -1

  #state = {
    bar: 0,
    beat: 0,
    last: 0,
  }

  constructor() {}

  set fs(v) {
    const fs = Number.parseFloat(`${v}`)

    if (!Number.isNaN(fs) && fs > 0.0) {
      this.#fs = fs
      this.#Δt = (1000 * this.#buffersize) / this.#fs
    }
  }

  set buffersize(v) {
    const N = Number.parseInt(`${v}`)

    if (!Number.isNaN(N) && N > 0) {
      this.#buffersize = N
      this.#Δt = (1000 * this.#buffersize) / this.#fs
    }
  }

  tick(BPM, tactus) {
    this.#tick = this.#tick < 0 ? 0 : this.#tick + 1

    const t = this.#tick > 0 ? this.#tick : 0

    return this.#tock(t, BPM, tactus)
  }

  #tock(tick, BPM, tactus) {
    // ... increment quarter note intervals
    const last = this.#state.last
    const start = tick * this.#Δt // ms
    const end = (tick + 1) * this.#Δt //ms
    let click = false

    let next = last
    let bar = this.#state.bar
    let beat = this.#state.beat

    let interval = (60 * 1000) / BPM
    while (next + interval < end) {
      next += interval
      beat += 1
    }

    beat = (Math.round(2 * beat) / 2) % tactus

    if (start <= next && next < end) {
      this.#state.last = next

      if (beat === 0) {
        bar += 1
      }
    }

    this.#state.bar = bar
    this.#state.beat = beat

    // ... increment eighth note intervals
    interval = (60 * 1000) / BPM / 2
    while (next + interval < end) {
      next += interval
      beat += 0.5
    }

    // ... click
    if (start <= next && next < end) {
      click = true
    }

    return {
      click: click,
      bar: bar,
      beat: beat + 1,
    }
  }
}
