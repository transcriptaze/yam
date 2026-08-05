import { OPCODES } from './constants.js'

export class VM {
  #worklet = {}
  #script = []
  #dt = (1000 * 128) / 44100
  #state = {
    t: 0,
    pc: 0,
    run: [],
  }

  constructor(fs, bufferSize, worklet, script) {
    this.#worklet = worklet
    this.#script = script
    this.#dt = (1000 * bufferSize) / fs

    this.#reset()
  }

  tick() {
    console.log(this.#dt)

    return OPCODES.NONE
  }

  // tick() {
  //   // ... schedule due operations
  //   const start = this.#state.t
  //   const end = this.#state.t + this.#dt
  //   let pc = this.#state.pc
  //
  //   if (pc < this.#program.length) {
  //     const op = this.#program[pc]
  //
  //     if (op.at >= start) {
  //       this.#state.run.push(op)
  //       pc++
  //     }
  //   }
  //
  //   this.#state.t += end
  //   this.#state.pc = pc
  //
  //   // ... exec
  //   const scheduled = this.#state.run
  //   scheduled.forEach((op) => {
  //     this.#exec(start, end, op)
  //   })
  //
  //   return OPCODES.NONE
  // }

  exec(beat) {
    const ops = []
    for (const op of this.#script) {
      if (op.beat === beat) {
        ops.push(...this.#exec(op.op))
      }
    }

    return ops
  }

  #reset() {
    this.#state.t = 0
    this.#state.pc = 0
    this.#state.run = []
  }

  #exec(op) {
    switch (op) {
      case OPCODES.TICK:
        return this.#worklet.tick()

      case OPCODES.TOCK:
        return this.#worklet.tock()

      case OPCODES.TACK:
        return this.#worklet.tack()

      case OPCODES.STICKS:
        return this.#worklet.sticks()

      case OPCODES.DING:
        return this.#worklet.ding()
    }

    return []
  }
}
