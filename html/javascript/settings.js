import { parseTimeSignature, parsePulse } from './util.js'

const FS = 48000 // samples/s
const PREAMBLE = 0.25 // seconds
const POSTAMBLE = 0.25 // seconds
const DURATION = 3 * 60 // seconds
const MAX = 5 * 60 // seconds

class Settings {
  #BPM = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #playlist = '00000000-0000-0000-0000-000000000000'

  #theme = 'default'
  #soundset = 'soundset'
  #volume = 1.0

  #clickTrack = {
    preamble: PREAMBLE,
    postamble: POSTAMBLE,
    duration: DURATION,
    max: MAX,
    sampleRate: FS,
  }

  get BPM() {
    return this.#BPM
  }

  set BPM(v) {
    const bpm = parseInt(`${v}`, 10)

    if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
      this.#BPM = bpm
    }
  }

  get timeSignature() {
    return this.#timeSignature
  }

  set timeSignature(v) {
    if (`${v}` === 'common') {
      this.#timeSignature = 'common'
    } else if (`${v}` === 'cut') {
      this.#timeSignature = 'cut'
    } else {
      const { beats, divisions } = parseTimeSignature(`${v}`)

      if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
        this.#timeSignature = `${beats}:${divisions}`
      }
    }
  }

  get pulse() {
    return this.#pulse
  }

  set pulse(v) {
    const pulse = parsePulse(`${v}`)

    if (pulse != null) {
      this.#pulse = pulse
    }
  }

  get playlist() {
    return this.#playlist || '00000000-0000-0000-0000-000000000000'
  }

  set playlist(v) {
    this.#playlist = v || '00000000-0000-0000-0000-000000000000'
  }

  get theme() {
    return this.#theme
  }

  set theme(v) {
    this.#theme = v ?? 'default'
  }

  get soundset() {
    return this.#soundset
  }

  set soundset(v) {}

  get volume() {
    return this.#volume
  }

  set volume(v) {
    const volume = parseFloat(`${v}`)

    if (!Number.isNaN(volume) && volume >= 0.0 && volume <= 4) {
      this.#volume = volume
    }
  }

  get clickTrack() {
    return this.#clickTrack
  }

  set clickTrack(object) {
    const merged = {
      ...this.#clickTrack,
      ...object,
    }

    this.#clickTrack = {
      preamble: Math.max(merged.preamble, 0),
      postamble: Math.max(merged.postamble, 0),
      duration: Math.max(merged.duration, 0),
      max: Math.max(merged.max, 0),
      sampleRate: Math.max(merged.sampleRate, 0),
    }
  }

  save() {
    const object = {
      settings: {
        BPM: this.BPM,
        timeSignature: this.timeSignature,
        pulse: this.pulse,
        playlist: this.playlist,

        theme: this.#theme,
        soundset: this.#soundset,
        volume: this.#volume,

        clickTrack: this.#clickTrack,
      },
    }

    localStorage.setItem('YAM', JSON.stringify(object))
  }

  restore() {
    try {
      const json = localStorage.getItem('YAM')
      const object = JSON.parse(json)

      this.BPM = object?.settings?.BPM
      this.timeSignature = object?.settings?.timeSignature
      this.pulse = object?.settings?.pulse
      this.playlist = object?.settings?.playlist

      this.theme = object?.settings.theme
      this.soundset = object?.settings.soundset
      this.volume = object?.settings.volume

      this.clickTrack = object?.settings.clickTrack
    } catch (err) {
      console.log(err)
    }
  }
}

export const settings = new Settings()
