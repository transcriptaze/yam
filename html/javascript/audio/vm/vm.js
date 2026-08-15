import { OPCODES, SUBDIVISIONS } from './constants.js'

export class VM {
  #script = []

  #dt = (1000 * 128) / 44100
  #tick = 0
  #time = 0
  #click = {
    time: Number.NEGATIVE_INFINITY,
    click: 0,
    measure: 0,
    beat: 0,
  }

  constructor(fs, bufferSize, script) {
    this.#script = script
    this.#dt = (1000 * bufferSize) / fs

    this.#reset()
  }

  tick(BPM) {
    const tick = this.#tick + 1
    const start = this.#time
    const end = tick * this.#dt

    this.#tick = tick
    this.#time = end

    const time = start / 1000

    // ... whole beats
    {
      const interval = 60000 / BPM // ms

      let next = this.#click.time < 0 ? 0.0 : this.#click.time + interval
      while (next < start) {
        next += interval
      }

      if (next >= start && next < end) {
        this.#click.time = next
        this.#click.click += 1

        return {
          time: time,
          click: this.#click.click,
        }
      }
    }

    // ... half beats
    {
      const interval = 60000 / BPM / 2 // ms

      let next = this.#click.time < 0 ? 0.0 : this.#click.time + interval
      while (next < start) {
        next += interval
      }

      if (next >= start && next < end) {
        return {
          time: time,
          click: this.#click.click + 0.5,
        }
      }
    }

    // ... default
    return {
      time: time,
    }
  }

  click(click, { beats, _divisions }) {
    // const q = Math.trunc(click)
    const r = click % 1

    let measure = this.#click.measure === 0 ? 1 : this.#click.measure
    let beat = this.#click.beat

    if (r === 0) {
      beat += 1
    }

    if (beat > beats) {
      beat = 1
      measure += 1
    }

    this.#click.measure = measure
    this.#click.beat = beat

    return {
      measure: measure,
      beat: beat + r,
    }
  }

  exec(at, subdivisions) {
    const ops = []

    for (const op of this.#script) {
      // const q = Math.trunc(at.beat)
      const r = at.beat % 1

      if (op.at.measure === at.measure && op.at.beat === at.beat) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*') {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === at.beat) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.QUARTER_NOTES && r === 0.0) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_DOUBLETS && (r === 0.0 || r === 0.5)) {
        ops.push(...this.#exec(op.op))
        break
      }
    }

    return ops
  }

  #reset() {
    this.#time = 0

    this.#click = {
      time: Number.NEGATIVE_INFINITY,
      click: 0,
      measure: 0,
      beat: 0,
    }
  }

  #exec(op) {
    switch (op) {
      case OPCODES.TICK:
        return [OPCODES.TICK]

      case OPCODES.TOCK:
        return [OPCODES.TOCK]

      case OPCODES.TACK:
        return [OPCODES.TACK]

      case OPCODES.STICKS:
        return [OPCODES.STICKS]

      case OPCODES.DING:
        return [OPCODES.DING]
    }

    return []
  }
}
