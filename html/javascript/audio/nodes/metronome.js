import { State, BUFFERSIZE } from '../shared/state.js'
import * as PULSE from '../shared/constants.js'
import { parseTimeSignature, durationToMS, clamp } from '../../util.js'
import * as generators from '../../generators.js'
import { EVENTS } from '../../constants.js'

const STATE = {
  START: 0,
  STOPPED: 1,
  STARTING: 2,
  PLAYING: 3,
  STOPPING: 4,
}

const INF = Number.POSITIVE_INFINITY

export class MetronomeNode extends AudioWorkletNode {
  #state = null
  #loops = INF
  #sections = new Map()

  #cache = {
    playing: false,
    stopped: false,
    section: 0,
    bar: 0,
    beat: 0,
    beats: 4,
    divisions: 4,
    pulse: 'quarter',
    loops: 0,
  }

  constructor(context, tick, tock, tack, stick, ding, subscribers) {
    super(context, 'metronome', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })

    this.subscribers = subscribers
    this.port.onmessage = this.onMessage.bind(this)

    // ... initialise shared state
    const buffer = new SharedArrayBuffer(BUFFERSIZE)

    this.#state = new State(buffer)

    // ... initialise worklet
    this.port.postMessage({
      message: 'initialise',

      fs: context.sampleRate,
      state: buffer,
      tick: sample(tick),
      tock: sample(tock),
      tack: sample(tack),
      ding: sample(ding),
      stick: sample(stick),
    })
  }

  onMessage(event) {
    switch (event.data.message) {
      case 'playing':
        this.subscribers.dispatchEvent(new CustomEvent(EVENTS.PLAYING, { detail: {} }))
        break

      case 'paused':
        this.subscribers.dispatchEvent(new CustomEvent(EVENTS.PAUSED, { detail: {} }))
        break

      case 'stopped':
        this.subscribers.dispatchEvent(new CustomEvent(EVENTS.STOPPED, { detail: {} }))
        break

      case 'flipped':
        this.#flipped(this.#state)
        break
    }
  }

  play() {
    this.port.postMessage({
      message: 'play',
    })
  }

  stop() {
    this.port.postMessage({
      message: 'stop',
    })
  }

  toggle() {
    this.port.postMessage({
      message: 'toggle',
    })
  }

  set debug(dbg) {
    this.port.postMessage({
      message: 'debug',
      debug: dbg,
    })
  }

  set BPM(bpm) {
    const ctx = this.context

    this.parameters.get('BPM').linearRampToValueAtTime(bpm, ctx.currentTime + 0.5)
  }

  set pulse(pulse) {
    const ctx = this.context
    const k = PULSE.pulseToInt(pulse)

    if (!Number.isNaN(k)) {
      this.parameters.get('pulse').setValueAtTime(k, ctx.currentTime)
    }
  }

  set timeSignature({ beats, divisions }) {
    const ctx = this.context

    this.parameters.get('beats').setValueAtTime(beats, ctx.currentTime)
    this.parameters.get('divisions').setValueAtTime(divisions, ctx.currentTime)
  }

  set track(v) {
    const track = transmogrify({
      tempo: v?.tempo,
      timeSignature: v?.timeSignature,
      pulse: v?.pulse,
      BPM: v?.BPM,
      loops: v?.loops ?? INF,
      clicks: v?.clicks ?? null,
      dings: v?.dings ?? [],
      sections: v?.sections ?? [],
    })

    this.#loops = v?.loops ?? INF

    this.#sections = new Map(
      track.sections.map((u) => [
        u.ID,
        {
          ID: u.ID,
          name: u.name,
          measures: u.measures,
          start: u.start,
        },
      ]),
    )

    this.port.postMessage({
      message: 'track',
      track: track,
    })

    // ... loop ?
    const ctx = this.context
    const loopable = v?.loopable ?? false
    const loop = v?.loop ?? false

    this.parameters.get('loop').setValueAtTime(loopable && loop, ctx.currentTime)
  }

  set loop(loop) {
    const ctx = this.context

    this.parameters.get('loop').setValueAtTime(loop, ctx.currentTime)
  }

  get playing() {
    return this.#cache.playing
  }

  get stopped() {
    return this.#cache.stopped
  }

  get section() {
    const section = this.#sections.get(this.#cache.section)

    if (section != null) {
      return {
        ID: section.ID,
        name: section.name,
        measures: section.measures,
        start: section.start,
      }
    }

    return {
      ID: -1,
      name: '',
      measures: Number.NaN,
      start: INF,
    }
  }

  get bar() {
    return this.#cache.bar
  }

  get beat() {
    return this.#cache.beat
  }

  get beats() {
    return this.#cache.beats
  }

  get divisions() {
    return this.#cache.divisions
  }

  get pulse() {
    return this.#cache.pulse
  }

  get loops() {
    return {
      loops: this.#loops,
      count: this.#cache.loops,
    }
  }

  #flipped(state) {
    this.#cache.playing = state.state === STATE.PLAYING
    this.#cache.stopped = state.state === STATE.STOPPED
    this.#cache.section = state.section
    this.#cache.bar = state.bar
    this.#cache.beat = state.beat
    this.#cache.beats = state.beats
    this.#cache.divisions = state.divisions
    this.#cache.pulse = PULSE.get(state.pulse)?.name ?? ''
    this.#cache.loops = state.loops
  }
}

function sample(buffer) {
  const channels = buffer.numberOfChannels
  let left = new Float32Array()
  let right = new Float32Array()

  if (channels > 0) {
    left = buffer.getChannelData(0)
    right = buffer.getChannelData(0)
  }

  if (channels > 1) {
    right = buffer.getChannelData(1)
  }

  return {
    length: buffer.length,
    left: left,
    right: right,
  }
}

function transmogrify(track) {
  const sections = [...generators.transmogrify(track)].map((u) => {
    const subsections = u.subsections.map((v) => {
      return {
        ...v,
        pulse: PULSE.pulseToInt(v.pulse),
        beats: parseTimeSignature(v.timeSignature).beats,
        divisions: parseTimeSignature(v.timeSignature).divisions,
        clicks: v.clicks,
      }
    })

    return { ...u, subsections }
  })

  const delay = track.sections?.length ? (track.sections[0].delay ?? 0) : 0
  const bars = sections.length === 0 ? INF : sections.reduce((measures, v) => measures + v.measures, 0)

  let offset = 0
  for (const section of sections) {
    if (section.role === 'count-in') {
      offset += section.measures
    } else if (section.role === 'anacrusis') {
      offset += section.measures
    } else {
      break
    }
  }

  return {
    tempo: track.tempo ?? 120,
    timeSignature: track.timeSignature ?? '',
    pulse: PULSE.pulseToInt(track.pulse ?? ''),
    BPM: track.BPM,
    loop: track.loop,
    loops: track.loops ?? INF,
    clicks: generators.clicks(track.clicks),
    dings: track.dings.map((v) => `${v + offset}`),
    delay: clamp(durationToMS(delay), 0, 5000),

    bars: bars,
    beats: parseTimeSignature(track.timeSignature).beats,
    divisions: parseTimeSignature(track.timeSignature).divisions,
    sections: sections,
  }
}
