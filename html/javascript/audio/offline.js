import * as nodes from './nodes/nodes.js'
import * as soundsets from './soundsets.js'
import { EVENTS } from '../constants.js'

export class Offline {
  #soundset = 'default'

  render(track) {
    const ctx = new OfflineAudioContext(2, 30 * 48000, 48000)
    const controller = new AbortController()
    const { signal } = controller

    const state = {
      subscribers: new EventTarget(),
      samples: 0,
      duration: 0,
    }

    state.subscribers.addEventListener(
      EVENTS.STOPPED,
      (event) => {
        state.samples = event.detail.samples
        state.duration = event.detail.duration
      },
      { once: true, signal },
    )

    const wait = () => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject('Offline AudioWorklet failed to initialise')
        }, 500)

        state.subscribers.addEventListener(
          EVENTS.READY,
          () => {
            clearTimeout(timer)
            resolve()
          },
          { once: true, signal },
        )
      })
    }

    return soundsets
      .get(ctx, this.#soundset)
      .then((sounds) => metronome(ctx, sounds, state.subscribers))
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
          samples: state.samples,
          duration: state.duration,
        }
      })
      .finally(() => {
        controller.abort()
      })
  }
}

function metronome(ctx, sounds, subscribers) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/worklet.js').then(() => new nodes.MetronomeNode(ctx, sounds, subscribers))
}
