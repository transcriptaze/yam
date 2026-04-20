import { engine } from '../audio/engine.js'
import { EVENTS } from '../constants.js'
import * as datastore from '../datastore/datastore.js'

class Statistics {
  #record = {
    track: null,
    start: null,
    end: null,
    bar: 0,
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

    save({ ...this.#record })

    if (event.detail.done) {
      this.#clear()
    }
  }

  onClick(e) {
    if (e.detail.track != null && e.detail.track !== '' && e.detail.track === this.#record.track) {
      if (e.detail.playing) {
        this.#record.bar = e.detail.bar > 0 ? e.detail.bar : 0
      }
    }
  }

  #clear() {
    this.#record.track = null
    this.#record.start = null
    this.#record.end = null
    this.#record.bar = 0
    this.#record.loops = 0
  }
}

const statistics = new Statistics()

export function initialise() {
  engine.addEventListener(EVENTS.PLAYING, (event) => statistics.onStart(event), false)
  engine.addEventListener(EVENTS.STOPPED, (event) => statistics.onStop(event), false)
  engine.addEventListener(EVENTS.CLICK, (event) => statistics.onClick(event), false)
}

function save(v) {
  new Promise(() => {
    const track = datastore.tracks.get(v.track)

    if (track != null) {
      const record = {
        ...v,
        title: track.title,
        countIn: track.countIn,
        pickup: track.pickup,
        measures: track.bars,
      }

      console.log('statistics::stop', record)
    }
  })
}
