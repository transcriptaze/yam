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

  #time = {
    tick: 0,
    t: 0,
    tʼ: 0,
  }

  #state = {
    stopped: false,
  }

  #click = {
    time: Number.NEGATIVE_INFINITY,
    click: 0,
    measure: 0,
    beat: 0,
  }

  #actions = {
    stop: (ops) => this.#stop(ops),
    tick: (ops) => this.#tick(ops),
    tock: (ops) => this.#tock(ops),
    tack: (ops) => this.#tack(ops),
    sticks: (ops) => this.#sticks(ops),
  }

  constructor(fs, script) {
    this.#fs = fs
    this.#script = script

    this.#reset()
  }

  tick(BPM, bufferSize) {
    const dt = (1000 * bufferSize) / this.#fs

    this.#time.tick++
    this.#time.t = this.#time.tʼ
    this.#time.tʼ = this.#time.tick * dt

    const start = this.#time.t
    const end = this.#time.tʼ
    const time = this.#time.t / 1000

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
          time,
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
          time,
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
          time,
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
          time,
          click: this.#click.click + 0.333,
        }
      }
    }

    // ... default
    return {
      time,
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

  exec(at, { _beats, divisions }, { subdivisions, ding }) {
    const ops = []

    for (const op of this.#script) {
      const q = Math.trunc(at.beat)
      const r = (() => {
        let k = at.beat % 1

        k = k.toFixed(3)
        k = parseFloat(k)

        return k
      })()

      // ... measure+beat spec i.e. { measure:1, beat:2}
      if (op.at.measure === at.measure && op.at.beat === at.beat) {
        const v = this.#exec(op.op, ops)

        if (v.includes(OPCODES.TEMPO)) {
          ops.push({ opcode: OPCODES.TEMPO, tempo: op.tempo })
        } else if (v.includes(OPCODES.TIME_SIGNATURE)) {
          ops.push({ opcode: OPCODES.TIME_SIGNATURE, timeSignature: op.timeSignature })
        } else if (v.includes(OPCODES.SUBDIVISIONS)) {
          ops.push({ opcode: OPCODES.SUBDIVISIONS, subdivisions: op.subdivisions })
        } else if (v.includes(OPCODES.DING) && ding) {
          ops.push(...v)
          break
        } else if (!v.includes(OPCODES.DING)) {
          ops.push(...v)
          break
        }
      }

      // ... measure spec e.g. count-in { measure:1, beat:'*'}
      // prettier-ignore
      if (op.at.measure === at.measure && op.at.beat === '*' && divisions === 2 && subdivisions === SUBDIVISIONS.QUARTER_NOTES && (r === 0.0 || r === 0.5)) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.HALF_NOTES && q % 2 === 0 && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.QUARTER_NOTES && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_DOUBLETS && (r === 0.0 || r === 0.5)) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_NOTES && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.DOTTED_QUARTERS && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.333) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === at.measure && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.667) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      // .... beat spec e.g. { measure:'*', beat:1}
      if (op.at.measure === '*' && op.at.beat === at.beat) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      // ... default i.e. { measure:'*', beat:'*'}
      // prettier-ignore
      if (op.at.measure === '*' && op.at.beat === '*' && divisions === 2 && subdivisions === SUBDIVISIONS.QUARTER_NOTES && (r === 0.0 || r === 0.5)) {
        ops.push(...this.#exec(op.op,ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.HALF_NOTES && q % 2 === 0 && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.QUARTER_NOTES && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_DOUBLETS && (r === 0.0 || r === 0.5)) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_NOTES && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.DOTTED_QUARTERS && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.0) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.333) {
        ops.push(...this.#exec(op.op, ops))
        break
      }

      if (op.at.measure === '*' && op.at.beat === '*' && subdivisions === SUBDIVISIONS.EIGHTH_TRIPLETS && r === 0.667) {
        ops.push(...this.#exec(op.op, ops))
        break
      }
    }

    return ops
  }

  #reset() {
    this.#time.tick = 0
    this.#time.t = 0
    this.#time.tʼ = 0

    this.#click = {
      time: Number.NEGATIVE_INFINITY,
      click: 0,
      measure: 0,
      beat: 0,
    }
  }

  #exec(op, ops) {
    switch (op) {
      case OPCODES.STOP:
        this.#actions.stop(ops)
        break

      case OPCODES.TICK:
        this.#actions.tick(ops)
        break

      case OPCODES.TOCK:
        this.#actions.tock(ops)
        break

      case OPCODES.TACK:
        this.#actions.tack(ops)
        break

      case OPCODES.STICKS:
        this.#actions.sticks(ops)
        break

      case OPCODES.DING:
        if (!this.#state.stopped) {
          return [OPCODES.DING]
        }
        break

      case OPCODES.TEMPO:
        if (!this.#state.stopped) {
          return [OPCODES.TEMPO]
        }
        break

      case OPCODES.TIME_SIGNATURE:
        if (!this.#state.stopped) {
          return [OPCODES.TIME_SIGNATURE]
        }
        break

      case OPCODES.SUBDIVISIONS:
        if (!this.#state.stopped) {
          return [OPCODES.SUBDIVISIONS]
        }
        break
    }

    return []
  }

  #stop(ops) {
    this.#state.stopped = true
    ops.push(OPCODES.STOP)
  }

  #tick(ops) {
    if (!this.#state.stopped) {
      ops.push(OPCODES.TICK)
    }
  }

  #tock(ops) {
    if (!this.#state.stopped) {
      ops.push(OPCODES.TOCK)
    }
  }

  #tack(ops) {
    if (!this.#state.stopped) {
      ops.push(OPCODES.TACK)
    }
  }

  #sticks(ops) {
    if (!this.#state.stopped) {
      ops.push(OPCODES.STICKS)
    }
  }
}
