import { parseTimeSignature } from '../../util.js'
import { EVENTS } from '../../constants.js'

import * as compiler from '../vm/compiler.js'
import { subdivisions2int } from '../vm/constants.js'

const STATE = {
  START: 0,
  STOPPED: 1,
  STARTING: 2,
  PLAYING: 3,
  STOPPING: 4,
}

const INF = Number.POSITIVE_INFINITY
// const MAX_DELAY = 30000 // ms

export class Metronome2Node extends AudioWorkletNode {
  #loops = INF
  // #pulse = ''

  #cache = {
    track: '',
    playing: false,
    stopped: false,
    bar: 0,
    beat: 0,
    loops: 0,
  }

  constructor(ctx, { tick, tock, tack, stick, ding }, subscribers) {
    super(ctx, 'metronome2', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })

    this.subscribers = subscribers
    this.port.onmessage = this.onMessage.bind(this)

    // ... initialise worklet
    this.port.postMessage({
      message: 'initialise',

      tick: sample(tick),
      tock: sample(tock),
      tack: sample(tack),
      ding: sample(ding),
      stick: sample(stick),
    })

    console.log('**** NODE2')
  }

  onMessage(event) {
    switch (event.data.message) {
      case 'ready':
        this.subscribers.dispatchEvent(
          new CustomEvent(EVENTS.READY, {
            detail: {
              track: event.data.track,
            },
          }),
        )
        break

      case 'playing':
        this.subscribers.dispatchEvent(
          new CustomEvent(EVENTS.PLAYING, {
            detail: {
              track: event.data.track,
              loops: event.data.loops,
              BPM: event.data.BPM,
            },
          }),
        )
        break

      case 'stopped':
        this.subscribers.dispatchEvent(
          new CustomEvent(EVENTS.STOPPED, {
            detail: {
              track: event.data.track,
              loops: event.data.loops,
              done: event.data.done,
              samples: event.data.samples,
              duration: event.data.duration,
            },
          }),
        )
        break

      case 'flipped':
        this.#flipped(event.data)

        this.subscribers.dispatchEvent(
          new CustomEvent(EVENTS.CLICK, {
            detail: {
              track: event.data.track,
              playing: this.playing,
              stopped: this.stopped,
              bar: this.bar,
              beat: this.beat,
              loops: this.loops,
            },
          }),
        )
        break

      case 'done':
        this.subscribers.dispatchEvent(
          new CustomEvent(EVENTS.DONE, {
            detail: {
              track: event.data.track,
            },
          }),
        )
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
    if (bpm != null) {
      if (this.playing) {
        this.parameters.get('BPM').linearRampToValueAtTime(bpm, this.context.currentTime + 0.5)
      } else {
        this.parameters.get('BPM').setValueAtTime(bpm, this.context.currentTime)
      }
    }
  }

  set timeSignature(timeSignature) {
    const { beats, divisions } = parseTimeSignature(timeSignature)

    if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
      this.parameters.get('beats').setValueAtTime(beats, this.context.currentTime)
      this.parameters.get('divisions').setValueAtTime(divisions, this.context.currentTime)
    }
  }

  set pulse(subdivisions) {
    const k = subdivisions2int(subdivisions)

    if (!Number.isNaN(k)) {
      this.parameters.get('pulse').setValueAtTime(k, this.context.currentTime)
    }
  }

  set loop(loop) {
    const ctx = this.context

    this.parameters.get('loop').setValueAtTime(loop ? 1 : 0, ctx.currentTime)
  }

  set ding(ding) {
    const ctx = this.context

    this.parameters.get('ding').setValueAtTime(ding ? 1 : 0, ctx.currentTime)
  }

  set track(track) {
    const script = compiler.compile(track)

    this.port.postMessage({
      message: 'script',
      script: script,
    })

    // if (v == null) {
    //   this.port.postMessage({ message: 'clear' })
    // } else {
    //   this.timeSignature = v?.timeSignature ?? this.timeSignature
    //   this.pulse = v?.pulse ?? this.pulse
    //   this.BPM = v?.BPM ?? this.BPM
    //   this.#loops = v?.loops ?? INF
    //
    //   const track = transmogrify({
    //     UUID: v?.UUID,
    //     tempo: v?.tempo,
    //     timeSignature: v?.timeSignature ?? this.#timeSignature,
    //     pulse: v?.pulse ?? this.#pulse,
    //     BPM: v?.BPM,
    //     loops: v?.loops ?? INF,
    //     clicks: v?.clicks ?? null,
    //     ding: v?.ding ?? false,
    //     dings: v?.dings ?? [],
    //     sections: v?.sections ?? [],
    //   })
    //
    //   this.port.postMessage({
    //     message: 'track',
    //     track: track,
    //   })
    //
    //   // ... loop ?
    //   const ctx = this.context
    //   const loopable = v?.loopable ?? false
    //   const loop = v?.loop ?? false
    //   const dings = track.dings ?? []
    //   const ding = track.ding ?? false
    //
    //   this.parameters.get('loop').setValueAtTime(loopable && loop ? 1 : 0, ctx.currentTime)
    //   this.parameters.get('ding').setValueAtTime(dings.length > 0 && ding ? 1 : 0, ctx.currentTime)
    // }
  }

  get playing() {
    return this.#cache.playing
  }

  get stopped() {
    return this.#cache.stopped
  }

  get bar() {
    return this.#cache.bar
  }

  get beat() {
    return this.#cache.beat
  }

  get loops() {
    return {
      loops: this.#loops,
      count: this.#cache.loops,
    }
  }

  #flipped(msg) {
    this.#cache.track = msg.track
    this.#cache.playing = msg.state === STATE.PLAYING
    this.#cache.stopped = msg.state === STATE.STOPPED
    this.#cache.bar = msg.bar
    this.#cache.beat = msg.beat
    this.#cache.loops = msg.loops
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
