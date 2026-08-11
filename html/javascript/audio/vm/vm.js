import { OPCODES } from './constants.js'

export class VM {
  #script = []

  #dt = (1000 * 128) / 44100
  #tick = 0
  #time = 0
  #click = {
    click: 0,
    time: Number.NEGATIVE_INFINITY,
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
      this.#click.click += 1
      this.#click.time = next

      return {
        time: start / 1000,
        click: this.#click.click,
      }
    }

    return {
      time: start / 1000,
    }
  }

  click(click, timeSignature) {
    const measure = Math.floor((click - 1) / timeSignature.beats) + 1
    const beat = Math.floor((click - 1) % timeSignature.beats) + 1

    return { measure, beat }
  }

  exec(at) {
    const ops = []

    for (const op of this.#script) {
      if (op.at.measure == null || op.at.measure === '*' || op.at.measure === at.measure) {
        if (op.at.beat === at.beat) {
          ops.push(...this.#exec(op.op))
        }
      }
    }

    return ops
  }

  #reset() {
    this.#time = 0
    this.#click = {
      click: 0,
      time: Number.NEGATIVE_INFINITY,
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
