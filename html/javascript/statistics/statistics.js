import { engine } from '../audio/engine.js'
import { EVENTS } from '../constants.js'

class Statistics {
  #record = {
    track: null,
    start: null,
    end: null,
  }

  onStart(e) {
    this.#clear()

    if (e.detail.track != null && e.detail.track !== '') {
      this.#record.track = e.detail.track
      this.#record.start = new Date()
    }
  }

  onStop(e) {
    if (e.detail.track == null || e.detail.track === '' || e.detail.track !== this.#record.track) {
      this.#clear()
    } else {
      this.#record.end = new Date()
    }

    this.#save()
    this.#clear()
  }

  #clear() {
    this.#record.track = null
    this.#record.start = null
    this.#record.end = null
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
