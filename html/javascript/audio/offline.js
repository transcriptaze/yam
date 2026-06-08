import * as nodes from './nodes/nodes.js'
import * as soundsets from './soundsets.js'
import { EVENTS, INF } from '../constants.js'

const FS = 48000

export class Offline {
  #soundset = 'default'

  render(track) {
    const preamble = 0.15
    const postamble = 0.25
    const duration = track.duration === INF ? 30 : Math.min(track.duration, 5 * 60)
    const samples = (preamble + duration + postamble) * FS
    const ctx = new OfflineAudioContext(2, samples, FS)
    const subscribers = new EventTarget()

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
      .then((sounds) => metronome(ctx, sounds, subscribers))
      .then((metronome) => {
        metronome.connect(ctx.destination)
        metronome.track = track
        metronome.play()
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

function metronome(ctx, sounds, subscribers) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/worklet.js').then(() => new nodes.MetronomeNode(ctx, sounds, subscribers))
}
