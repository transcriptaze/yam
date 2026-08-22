import { OPCODES, SUBDIVISIONS } from './constants.js'

const PULSE = new Map([
  ['eighth', 8],
  ['eighth-triplet', 8],
  ['eighth-doublet', 4],
  ['quarter', 4],
  ['dotted-quarter', 8],
  ['half', 2],
])

export class VM {
  #fs = 44100
  #script = []

  #tick = 0
  #time = 0
  #click = {
    time: Number.NEGATIVE_INFINITY,
    click: 0,
    measure: 0,
    beat: 0,
  }

  constructor(fs, script) {
    this.#fs = fs
    this.#script = script

    this.#reset()
  }

  tick(BPM, bufferSize) {
    const dt = (1000 * bufferSize) / this.#fs
    const tick = this.#tick + 1
    const start = this.#time
    const end = tick * dt

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

    // ... dotted quarters, triplets, etc
    {
      const interval = (2 * 60000) / BPM / 3 // ms

      let next = this.#click.time < 0 ? 0.0 : this.#click.time + interval
      while (next < start) {
        next += interval
      }

      if (next >= start && next < end) {
        return {
          time: time,
          click: this.#click.click + 0.667,
        }
      }
    }

    {
      const interval = 60000 / BPM / 3 // ms

      let next = this.#click.time < 0 ? 0.0 : this.#click.time + interval
      while (next < start) {
        next += interval
      }

      if (next >= start && next < end) {
        return {
          time: time,
          click: this.#click.click + 0.333,
        }
      }
    }

    // ... default
    return {
      time: time,
    }
  }

  click(click, { beats, divisions }, subdivisions) {
    const pulse = PULSE.get(subdivisions) ?? 4
    const klick = (() => {
      let k = ((click - 1) * divisions) / pulse

      k = k.toFixed(3)
      k = parseFloat(k)

      return k
    })()

    const _q = Math.trunc(klick)
    const r = (() => {
      let k = klick % 1

      k = k.toFixed(3)
      k = parseFloat(k)

      return k
    })()

    let measure = this.#click.measure === 0 ? 1 : this.#click.measure
    let beat = this.#click.beat

    if (r === 0) {
      beat += 1
    }

    if (beat > beats) {
      measure += 1
      beat = 1
    } else if (subdivisions === SUBDIVISIONS.DOTTED_QUARTERS && beat > beats / 3) {
      measure += 1
      beat = 1
    } else if (subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && beat > beats / 3) {
      measure += 1
      beat = 1
    }

    this.#click.measure = measure
    this.#click.beat = beat

    return {
      measure: measure,
      beat: beat + r,
    }
  }

  exec(at, { _beats, divisions }, subdivisions) {
    const ops = []

    for (const op of this.#script) {
      const q = Math.trunc(at.beat)
      const r = (() => {
        let k = at.beat % 1

        k = k.toFixed(3)
        k = parseFloat(k)

        return k
      })()

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

      // prettier-ignore
      if (op.at.measure === '*' && op.at.beat === '*' && divisions === 2 && subdivisions === SUBDIVISIONS.QUARTER_NOTES && (r === 0.0 || r === 0.5)) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.HALF_NOTES && q % 2 === 0 && r === 0.0) {
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

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_NOTES && r === 0.0) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.DOTTED_QUARTERS && r === 0.0) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.0) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.333) {
        ops.push(...this.#exec(op.op))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.667) {
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
