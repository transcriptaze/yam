// offsets into shared buffer
const HEAD = 0
const TAIL = 4

const STATE = 0
const SECTION = 4
const BAR = 8
const BEAT = 12
const BEATS = 16
const DIVISIONS = 20
const BPM = 24
const TIMESIGNATURE = 28 // 16 bytes
const PULSE = 44
const LOOPS = 48
const _SPARE = 52 // 12 bytes

const HEADER = 8
const DATA = 64
export const BUFFERSIZE = HEADER + 2 * DATA

export class State {
  #buffer = null
  #u8 = null

  constructor(buffer) {
    this.#buffer = new DataView(buffer)
    this.#u8 = new Uint8Array(buffer)

    this.#head = 1
    this.#tail = 0

    this.state = null
    this.section = null
    this.bar = null
    this.beat = null
    this.beats = null
    this.divisions = null
    this.BPM = null
    this.timeSignature = null
    this.pulse = null
    this.loops = null
  }

  get #head() {
    return this.#buffer.getUint32(HEAD)
  }

  set #head(v) {
    this.#buffer.setUint32(HEAD, v)
  }

  get #tail() {
    return this.#buffer.getUint32(TAIL)
  }

  set #tail(v) {
    this.#buffer.setUint32(TAIL, v)
  }

  #getUint32(offset) {
    const base = HEADER + this.#tail * DATA

    return this.#buffer.getUint32(base + offset)
  }

  #setUint32(offset, v) {
    const base = HEADER + this.#head * DATA

    this.#buffer.setUint32(base + offset, v)
  }

  #getFloat32(offset) {
    const base = HEADER + this.#tail * DATA

    return this.#buffer.getFloat32(base + offset)
  }

  #setFloat32(offset, v) {
    const base = HEADER + this.#head * DATA

    this.#buffer.setFloat32(base + offset, v)
  }

  #getBytes(offset) {
    const base = HEADER + this.#tail * DATA

    return this.#u8.subarray(base + offset, base + offset + 16)
  }

  #setBytes(offset, v) {
    const base = HEADER + this.#head * DATA

    this.#u8.set(v, base + offset)
  }

  flip() {
    this.#tail = (this.#tail + 1) % 2
    this.#head = (this.#head + 1) % 2
  }

  get state() {
    return this.#getUint32(STATE)
  }

  set state(v) {
    this.#setUint32(STATE, v ?? 0)
  }

  get section() {
    return this.#getUint32(SECTION)
  }

  set section(v) {
    this.#setUint32(SECTION, v ?? 0)
  }

  get bar() {
    return this.#getUint32(BAR)
  }

  set bar(v) {
    this.#setUint32(BAR, v ?? 0)
  }

  get beat() {
    return this.#getFloat32(BEAT)
  }

  set beat(v) {
    this.#setFloat32(BEAT, v ?? 0)
  }

  get beats() {
    return this.#getUint32(BEATS)
  }

  set beats(v) {
    this.#setUint32(BEATS, v ?? 0)
  }

  get divisions() {
    return this.#getUint32(DIVISIONS)
  }

  set divisions(v) {
    this.#setUint32(DIVISIONS, v ?? 0)
  }

  get BPM() {
    return this.#getUint32(BPM)
  }

  set BPM(v) {
    this.#setUint32(BPM, v ?? 120)
  }

  get timeSignature() {
    const v = this.#getBytes(TIMESIGNATURE)
    const timeSignature = String.fromCharCode(...v).trimEnd()

    return timeSignature
  }

  set timeSignature(v) {
    const timeSignature = [...(v ?? '').slice(0, 16).padEnd(16, ' ')].map((c) => c.charCodeAt(0))

    this.#setBytes(TIMESIGNATURE, timeSignature)
  }

  get pulse() {
    return this.#getFloat32(PULSE)
  }

  set pulse(v) {
    this.#setFloat32(PULSE, v ?? 0.0)
  }

  get loops() {
    return this.#getUint32(LOOPS)
  }

  set loops(v) {
    this.#setUint32(LOOPS, v ?? 0)
  }

  reset() {
    this.bar = 0
    this.beat = 0
  }
}
