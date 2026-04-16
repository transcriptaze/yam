import { engine } from '../audio/engine.js'
import { EVENTS } from '../constants.js'

class Statistics {
  #record = {
    track: null,
    start: null,
    end: null,
    loops: 0,
  }

  onStart(e) {
    if (e.detail.track != null && e.detail.track !== '' && e.detail.track === this.#record.track) {
      this.#record.loops = event.detail.loops
    } else if (e.detail.track != null && e.detail.track !== '') {
      this.#clear()

      this.#record.track = e.detail.track
      this.#record.start = new Date()
      this.#record.loops = event.detail.loops
    }
  }

  onStop(e) {
    if (e.detail.track == null || e.detail.track === '' || e.detail.track !== this.#record.track) {
      this.#clear()
      return
    }

    this.#record.end = new Date()
    this.#record.loops = event.detail.loops
    this.#save()

    if (event.detail.done) {
      this.#clear()
    }
  }

  #clear() {
    this.#record.track = null
    this.#record.start = null
    this.#record.end = null
    this.#record.loops = 0
  }

  #save() {
    console.log('statistics::stop', this.#record)
  }
}

const statistics = new Statistics()

export function initialise() {
  engine.addEventListener(EVENTS.PLAYING, (event) => statistics.onStart(event), false)
  engine.addEventListener(EVENTS.STOPPED, (event) => statistics.onStop(event), false)
}
