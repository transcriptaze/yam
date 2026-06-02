import * as nodes from './nodes/nodes.js'
import * as soundsets from './soundsets.js'
import { EVENTS } from '../constants.js'

export class Offline {
  #soundset = 'default'
  #subscribers = new EventTarget()

  constructor() {
    this.#subscribers.addEventListener(
      EVENTS.PLAYING,
      () => {
        console.log('playing')
      },
      false,
    )
    this.#subscribers.addEventListener(
      EVENTS.STOPPED,
      () => {
        console.log('stopped')
      },
      false,
    )
    this.#subscribers.addEventListener(
      EVENTS.CLICK,
      () => {
        console.log('click')
      },
      false,
    )

    this.#subscribers.addEventListener(
      EVENTS.DONE,
      () => {
        console.log('-- done')
      },
      false,
    )
  }

  render(track) {
    const ctx = new OfflineAudioContext(2, 30 * 48000, 48000)

    return soundsets
      .get(ctx, this.#soundset)
      .then((sounds) => metronome(ctx, sounds, this.#subscribers))
      .then((metronome) => {
        metronome.connect(ctx.destination)
        metronome.track = track
        metronome.play()

        return ctx.startRendering()
      })
  }
}

function metronome(ctx, sounds, subscribers) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/worklet.js').then(() => new nodes.MetronomeNode(ctx, sounds, subscribers))
}
