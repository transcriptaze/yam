export class Klock {
  #klock = {
    generator: null,
    fs: 44100,
    Δt: (1000 * 128) / 44100,
    buffersize: 128,
  }

  #state = {
    bar: 0,
    beat: 0,
    last: 0,
  }

  constructor(fs, buffersize, BPM, tactus) {
    this.#fs = fs
    this.#buffersize = buffersize
    this.#klock.generator = this.#run(BPM, tactus)
  }

  set #fs(v) {
    const fs = Number.parseFloat(`${v}`)

    if (!Number.isNaN(fs) && fs > 0.0) {
      this.#klock.fs = fs
      this.#klock.Δt = (1000 * this.#klock.buffersize) / this.#klock.fs
    }
  }

  set #buffersize(v) {
    const N = Number.parseInt(`${v}`)

    if (!Number.isNaN(N) && N > 0) {
      this.#klock.buffersize = N
      this.#klock.Δt = (1000 * this.#klock.buffersize) / this.#klock.fs
    }
  }

  // NTS: generator.next(..) return { click, bar, beat, BPM, tactus, ... }
  tick(BPM, tactus) {
    const state = this.#klock.generator.next({ BPM, tactus }).value

    return {
      click: state.click,
      bar: state.bar,
      beat: state.beat,
    }
  }

  *#run(BPM, tactus) {
    const state = {
      tick: 0,
      BPM: BPM,
      tactus: tactus,
    }

    while (true) {
      const tock = yield this.#tock(state.tick, state.BPM, state.tactus)

      state.BPM = tock.BPM
      state.tactus = tock.tactus
      state.tick++
    }
  }

  #tock(tick, BPM, tactus) {
    // ... increment quarter note intervals
    const last = this.#state.last
    const start = tick * this.#klock.Δt // ms
    const end = (tick + 1) * this.#klock.Δt //ms
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

      BPM: BPM,
      tactus: tactus,
    }
  }
}
