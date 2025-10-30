import { parseTimeSignature, parsePulse } from './util.js'

class Settings {
  #BPM = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #playlist = '00000000-0000-0000-0000-000000000000'

  #theme = 'default'
  #volume = 1.0

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

  set theme(v) {}

  get volume() {
    return this.#volume
  }

  set volume(v) {
    const volume = parseFloat(`${v}`)

    if (!Number.isNaN(volume) && volume >= 0.0 && volume <= 4) {
      this.#volume = volume
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
        volume: this.#volume,
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
      this.volume = object?.settings.volume
    } catch (err) {
      console.log(err)
    }
  }
}

export const settings = new Settings()
