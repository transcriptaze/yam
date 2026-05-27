export const OPCODES = {
  NONE: 0,
  DELAY: 1,
  TICK: 2,
}

export class VM {
  #program = []
  #dt = (1000 * 128) / 44100
  #state = {
    t: 0,
    pc: 0,
    run: [],
  }

  constructor(fs, bufferSize, program) {
    this.#program = program
    this.#dt = (1000 * bufferSize) / fs

    this.#reset()
  }

  tick() {
    // ... schedule due operations
    const start = this.#state.t
    const end = this.#state.t + this.#dt
    let pc = this.#state.pc

    if (pc < this.#program.length) {
      const op = this.#program[pc]

      if (op.at >= start) {
        this.#state.run.push(op)
        pc++
      }
    }

    this.#state.t += end
    this.#state.pc = pc

    // ... exec
    const scheduled = this.#state.run
    scheduled.forEach((op) => {
      this.#exec(start, end, op)
    })

    return OPCODES.NONE
  }

  #reset() {
    this.#state.t = 0
    this.#state.pc = 0
    this.#state.run = []
  }

  #exec(start, end, op) {
    console.log(op)
  }
}
