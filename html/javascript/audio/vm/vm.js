import { OPCODES } from './constants.js'

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
    const interval = 60000 / BPM // ms

    let next = this.#click.time < 0 ? 0.0 : this.#click.time + interval
    while (next < start) {
      next += interval
    }

    this.#tick = tick
    this.#time = end

    if (next >= start && next < end) {
      this.#click.time = next
      this.#click.click += 1

      return {
        time: start / 1000,
        click: this.#click.click,
      }
    }

    return {
      time: start / 1000,
    }
  }

  click({ beats, _divisions }) {
    let measure = this.#click.measure === 0 ? 1 : this.#click.measure
    let beat = this.#click.beat === 0 ? 1 : this.#click.beat + 1

    if (beat > beats) {
      beat = 1
      measure += 1
    }

    this.#click.measure = measure
    this.#click.beat = beat

    return { measure, beat }
  }

  exec(at) {
    const ops = []

    for (const op of this.#script) {
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

      if (op.at.measure === '*' && op.at.beat === '*') {
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
