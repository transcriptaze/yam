import { parseTimeSignature, parsePulse } from './util.js'

class State extends EventTarget {
  #playlist = '00000000-0000-0000-0000-000000000000'
  #track = null

  #title = ''
  #BPM = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #loop = false
  #ding = false
  #modified = false

  #wakelock = {
    lock: null,
    enabled: true,
  }

  constructor() {
    super()
  }

  initialise(settings) {
    this.#title = ''
    this.#playlist = settings.playlist ?? '00000000-0000-0000-0000-000000000000'
    this.#BPM = settings.BPM ?? 120
    this.#timeSignature = settings.timeSignature ?? '4:4'
    this.#pulse = settings.pulse ?? 'quarter'
    this.#loop = false
    this.#ding = false
  }

  get modified() {
    return this.#modified
  }

  get title() {
    return this.#title
  }

  set title(v) {
    this.#title = `${v}`
    this.#modified = `${v}`.trim() !== ''
  }

  get BPM() {
    return this.#BPM
  }

  set BPM(v) {
    if (v != null) {
      const bpm = parseInt(`${v}`, 10)

      if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200 && bpm != this.BPM) {
        this.#BPM = bpm

        // NTS: DO NOT reset to false
        if (this.track !== '') {
          this.#modified = true
        }

        this.dispatchEvent(new CustomEvent('change', { detail: {} }))
      }
    }
  }

  get pulse() {
    return this.#pulse
  }

  set pulse(v) {
    if (v != null) {
      const pulse = parsePulse(v)

      if (pulse != null) {
        this.#pulse = pulse

        // NTS: DO NOT reset to false
        if (this.track !== '') {
          this.#modified = true
        }

        this.dispatchEvent(new CustomEvent('change', { detail: {} }))
      }
    }
  }

  get loop() {
    return this.#loop
  }

  set loop(v) {
    this.#loop = v === true

    // NTS: DO NOT reset to false
    if (this.track !== '') {
      this.#modified = true
    }

    this.dispatchEvent(new CustomEvent('change', { detail: {} }))
  }

  get ding() {
    return this.#ding
  }

  set ding(v) {
    this.#ding = v === true

    // NTS: DO NOT reset to false
    if (this.track !== '') {
      this.#modified = true
    }

    this.dispatchEvent(new CustomEvent('change', { detail: {} }))
  }

  set MM({ BPM, pulse }) {
    const mm = {
      BPM: this.BPM,
      pulse: this.pulse,
    }

    if (BPM != null) {
      const v = parseInt(`${BPM}`, 10)
      if (!Number.isNaN(v) && v >= 40 && v <= 200 && v != this.BPM) {
        this.#BPM = v
      }
    }

    if (pulse != null) {
      const v = parsePulse(pulse)
      if (v != null && v != this.#pulse) {
        this.#pulse = v
      }
    }

    if (mm.pulse !== this.pulse || mm.BPM !== this.BPM) {
      // NTS: DO NOT reset to false
      if (this.track !== '') {
        this.#modified = true
      }

      this.dispatchEvent(new CustomEvent('change', { detail: {} }))
    }
  }

  get timeSignature() {
    return this.#timeSignature
  }

  set timeSignature(v) {
    const notify = () => {
      // NTS: DO NOT reset to false
      if (this.track !== '') {
        this.#modified = true
      }

      this.dispatchEvent(new CustomEvent('change', { detail: {} }))
    }

    if (`${v}` === 'common' && this.#timeSignature !== 'common') {
      this.#timeSignature = `common`
      notify()
    } else if (`${v}` === 'cut' && this.#timeSignature !== 'cut') {
      this.#timeSignature = `cut`
      notify()
    } else {
      const { beats, divisions } = parseTimeSignature(`${v}`)

      if (!Number.isNaN(beats) && !Number.isNaN(divisions) && this.#timeSignature !== `${v}`) {
        this.#timeSignature = `${beats}:${divisions}`
        notify()
      }
    }
  }

  get playlist() {
    return this.#playlist || '00000000-0000-0000-0000-000000000000'
  }

  set playlist(v) {
    this.#playlist = v || '00000000-0000-0000-0000-000000000000'
  }

  get track() {
    return this.#track?.UUID ?? ''
  }

  set selected({ playlist, track }) {
    this.#playlist = playlist ?? '00000000-0000-0000-0000-000000000000'

    this.#track = track
    this.#title = track?.title ?? ''
    this.#BPM = track?.BPM ?? this.#BPM
    this.#timeSignature = track?.timeSignature ?? this.#timeSignature
    this.#pulse = track?.pulse ?? this.#pulse
    this.#loop = track?.loop ?? false
    this.#modified = false

    this.dispatchEvent(new CustomEvent('change', { detail: {} }))
  }

  equals({ title, BPM, timeSignature, pulse }) {
    return this.title.trim() === `${title}`.trim() && this.BPM === BPM && this.timeSignature === timeSignature && this.pulse === pulse
  }

  commit() {
    this.#modified = false
  }

  reset({ title, BPM, timeSignature, pulse }) {
    this.#title = title ?? ''
    this.#BPM = BPM
    this.#timeSignature = timeSignature
    this.#pulse = pulse
    this.#loop = false
    this.#modified = false

    this.dispatchEvent(new CustomEvent('change', { detail: {} }))
  }

  async requestWakeLock(button) {
    try {
      if ('wakeLock' in navigator) {
        button.disabled = false

        if (this.#wakelock.enabled && (this.#wakelock.lock == null || this.#wakelock.lock.released)) {
          const wakelock = await navigator.wakeLock.request('screen')

          button.classList.add('active')

          wakelock.onrelease = (e) => {
            console.log('wake lock released', e)
            button.classList.remove('active')
          }

          this.#wakelock.lock = wakelock
          console.log('wake lock acquired')
        }
      } else {
        button.disabled = true
      }
    } catch (err) {
      console.log('wakelock', err)
      this.#wakelock.enabled = false
      button.classList.remove('active')
    }
  }

  async toggleWakeLock(button) {
    try {
      if (this.#wakelock.enabled) {
        this.#wakelock.enabled = false

        if (this.#wakelock.lock != null && !this.#wakelock.lock.released) {
          this.#wakelock.lock.release()
        }
      } else {
        this.#wakelock.enabled = true

        if (this.#wakelock.lock == null || this.#wakelock.lock.released) {
          this.requestWakeLock(button)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }
}

export const state = new State()
