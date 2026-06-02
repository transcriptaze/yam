import * as nodes from './nodes/nodes.js'
import * as soundsets from './soundsets.js'
import { EVENTS } from '../constants.js'

// const AudioContext = window.AudioContext || window.webkitAudioContext

let audioContext

export class AudioRecorder {
  #metronome = null
  #recorder = null
  #initialised = false

  #BPM = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #track = null
  #ding = false
  #soundset = 'default'

  #subscribers = new EventTarget()

  constructor() {
    this.#subscribers.addEventListener(EVENTS.PLAYING, () => {}, false)
    this.#subscribers.addEventListener(EVENTS.STOPPED, () => {}, false)
    this.#subscribers.addEventListener(EVENTS.CLICK, () => {}, false)

    this.#subscribers.addEventListener(
      EVENTS.DONE,
      () => {
        if (this.#recorder) {
          this.#recorder.stop()
        }
      },
      false,
    )
  }

  #init(ctx) {
    if (this.initialised) {
      return Promise.resolve()
    } else {
      return soundsets
        .get(ctx, this.#soundset)
        .then((sounds) => metronome(ctx, sounds, this.#subscribers))
        .then((metronome) => {
          metronome.track = this.#track

          // NTS: expects set::track to also set pulse, BPM, loop and ding
          metronome.timeSignature = this.#timeSignature
          metronome.pulse = this.#pulse
          metronome.BPM = this.#BPM
          metronome.loop = false
          metronome.ding = this.#ding

          console.log(ctx)

          const stream = ctx.createMediaStreamDestination()
          const recorder = new MediaRecorder(stream.stream)

          metronome.connect(stream)

          this.#metronome = metronome
          this.#recorder = recorder
          this.#initialised = true
        })
    }
  }

  #exec(f) {
    audioContext ??= new AudioContext()

    return audioContext
      .resume()
      .then(() => this.#init(audioContext))
      .then(() => f())
      .catch((err) => console.error(err))
  }

  get initialised() {
    return this.#initialised
  }

  set track(track) {
    this.#track = track

    if (track != null) {
      this.timeSignature = track.timeSignature
      this.pulse = track.pulse
      this.BPM = track.BPM
      this.loop = track.loop
      this.ding = track.ding
    }

    if (this.initialised) {
      this.#metronome.track = track
    }
  }

  render(track, callback) {
    this.track = track

    this.#exec(() => {
      const audio = []

      this.#recorder.ondataavailable = (e) => {
        audio.push(e.data)
      }

      this.#recorder.onstop = (_e) => {
        const blob = new Blob(audio, { type: 'audio/webm; codecs=opus' })

        if (callback != null) {
          callback(blob)
        }
      }

      if (this.#recorder) {
        if (this.paused) {
          this.#recorder.resume()
        } else {
          this.#recorder.start()
        }

        this.#metronome.play()
      }
    })
  }

  get paused() {
    if (this.#recorder) {
      return this.#recorder.state === 'paused'
    }

    return false
  }

  // start () {
  //   this.audio = []
  //   this.blob = null
  //
  //   this.reset()
  //
  //   if (this.internal.recorder) {
  //     if (this.paused) {
  //       this.internal.recorder.resume()
  //     } else {
  //       this.internal.recorder.start()
  //     }
  //
  //     this.internal.recording = true
  //   }
  // }
  //
  // stop () {
  //   if (this.internal.recorder) {
  //     this.internal.recorder.stop()
  //   }
  //
  //   this.internal.recording = false
  // }
  //
  // pause () {
  //   if (this.internal.recorder && this.recording) {
  //     this.internal.recorder.pause()
  //   }
  // }
  //
  // resume () {
  //   if (this.internal.recorder) {
  //     this.internal.recorder.start()
  //   }
  // }
}

function metronome(ctx, sounds, subscribers) {
  return ctx.audioWorklet.addModule('./javascript/audio/worklets/worklet.js').then(() => new nodes.MetronomeNode(ctx, sounds, subscribers))
}

export const recorder = new AudioRecorder()
