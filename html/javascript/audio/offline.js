import * as nodes from './nodes/nodes.js'
import * as soundsets from './soundsets.js'
import { INF } from '../constants.js'

const FS = 48000
const _PREAMBLE = 0.0
const POSTAMBLE = 0.25
const MAX = 5 * 60

export class Offline {
  #soundset = 'default'

  render(track, settings) {
    const fs = settings?.sampleRate ?? FS
    const samples = bufferSize(track, settings, fs)
    const ctx = new OfflineAudioContext(2, samples, fs)

    return soundsets
      .get(ctx, this.#soundset)
      .then((sounds) => offline(ctx, sounds))
      .then((node) => node.render(track))
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

function offline(ctx, sounds) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/offline.js').then(() => new nodes.OfflineNode(ctx, sounds))
}
