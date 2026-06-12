import * as nodes from './nodes/nodes.js'
import * as soundsets from './soundsets.js'
import { EVENTS, INF } from '../constants.js'

const FS = 48000
const _PREAMBLE = 0.0
const POSTAMBLE = 0.25
const MAX = 5 * 60

export class Offline {
  #soundset = 'default'

  render(track, settings) {
    const subscribers = new EventTarget()
    const fs = settings?.sampleRate ?? FS
    const samples = bufferSize(track, settings, fs)
    const ctx = new OfflineAudioContext(2, samples, fs)

    const wait = () => {
      return new Promise((resolve, reject) => {
        const onReady = () => {
          clearTimeout(timer)
          resolve()
        }

        const timer = setTimeout(() => {
          subscribers.removeEventListener(EVENTS.READY, onReady)
          reject('Offline AudioWorklet failed to initialise')
        }, 500)

        subscribers.addEventListener(EVENTS.READY, onReady, { once: true })
      })
    }

    return soundsets
      .get(ctx, this.#soundset)
      .then((sounds) => offline(ctx, sounds, subscribers))
      .then((metronome) => {
        metronome.connect(ctx.destination)
        metronome.offline = true
        metronome.render(track)
      })
      .then(() => wait())
      .then(() => ctx.startRendering())
      .then((buffer) => {
        return {
          buffer: buffer,
        }
      })
  }
}

function bufferSize(track, settings, fs) {
  const preamble = 0 // settings?.preamble ?? PREAMBLE
  const postamble = settings?.postamble ?? POSTAMBLE
  const max = settings?.max ?? MAX
  const duration = settings?.duration ?? max

  if (track.duration !== INF) {
    return (preamble + clamp(track.duration, 0, max) + postamble) * fs
  }

  return (preamble + duration + postamble) * fs
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function offline(ctx, sounds, subscribers) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/offline.js').then(() => new nodes.OfflineNode(ctx, sounds, subscribers))
}
