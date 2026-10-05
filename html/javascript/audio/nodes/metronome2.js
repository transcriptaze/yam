import { parseTimeSignature } from '../../util.js'
import { EVENTS } from '../../constants.js'

import * as compiler from '../vm/compiler.js'
import * as linker from '../vm/linker.js'

const STATE = {
  START: 0,
  STOPPED: 1,
  STARTING: 2,
  PLAYING: 3,
  STOPPING: 4,
}

const INF = Number.POSITIVE_INFINITY

export class Metronome2Node extends AudioWorkletNode {
  #loops = INF

  #cache = {
    track: '',
    playing: false,
    stopped: false,
    bar: 0,
    beat: 0,
    loops: 0,
  }

  constructor(ctx, { tick, tock, tack, stick, ding, skip }, subscribers) {
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
      sticks: sample(stick),
      skip: sample(skip),
    })
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
      this.port.postMessage({
        message: 'time-signature',
        beats: beats,
        divisions: divisions,
      })
    }
  }

  set pulse(subdivisions) {
    this.port.postMessage({
      message: 'subdivisions',
      subdivisions: subdivisions,
    })
  }

  set loop(loop) {
    this.port.postMessage({
      message: 'loop',
      loop: loop === true,
    })
  }

  set ding(ding) {
    this.port.postMessage({
      message: 'ding',
      ding: ding === true,
    })
  }

  set track(track) {
    const script = compiler.compile(track)

    linker.link(script)

    this.#loops = script?.loops ?? INF

    this.port.postMessage({
      message: 'script',
      script: script,
    })
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
