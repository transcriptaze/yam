import { engine } from '../audio/engine.js'
import { UUIDv4 } from '../uuid.js'
import * as datastore from '../datastore/datastore.js'
import * as DB from '../db/db.js'
import { EVENTS } from '../constants.js'

class Statistics {
  #record = {
    UUID: null,
    track: null,
    start: null,
    end: null,
    bar: 0,
    loops: 0,
    BPM: 0,
  }

  #rs = []

  load(list) {
    this.#rs = list
  }

  summarize(track) {
    const summary = {
      track: track,
      played: 0,
      lastPlayed: null,
    }

    const records = this.#rs.filter((v) => v.track === track)

    summary.played += records.length

    for (const record of records) {
      const ms = record.start.getMilliseconds()

      if (!Number.isNaN(ms)) {
        if (summary.lastPlayed == null) {
          summary.lastPlayed = record.start
        } else if (ms > summary.lastPlayed.getMilliseconds) {
          summary.lastPlayed = record.start
        }
      }
    }

    return summary
  }

  onStart(e) {
    if (e.detail.track != null && e.detail.track !== '' && e.detail.track === this.#record.track) {
      this.#record.loops = event.detail.loops
    } else if (e.detail.track != null && e.detail.track !== '') {
      this.#clear()

      this.#record.UUID = UUIDv4().next().value
      this.#record.track = e.detail.track
      this.#record.start = new Date()
      this.#record.loops = event.detail.loops
      this.#record.BPM = event.detail.BPM
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
    this.#record.UUID = null
    this.#record.track = null
    this.#record.start = null
    this.#record.end = null
    this.#record.bar = 0
    this.#record.loops = 0
    this.#record.BPM = 0
  }
}

const statistics = new Statistics()

export function restore() {
  engine.addEventListener(EVENTS.PLAYING, (event) => statistics.onStart(event), false)
  engine.addEventListener(EVENTS.STOPPED, (event) => statistics.onStop(event), false)
  engine.addEventListener(EVENTS.CLICK, (event) => statistics.onClick(event), false)

  return DB.statistics().then((list) => {
    statistics.load(list)

    return statistics
  })
}

export function get() {
  return DB.statistics()
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
        tempo: track.tempo,
      }

      try {
        DB.putStatistic(record)
      } catch (err) {
        console.error(err)
      }
    }
  })
}
