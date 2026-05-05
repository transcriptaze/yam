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
    bars: 0,
    BPM: 0,
    complete: false,
  }

  #rs = []

  load(list) {
    this.#rs = list
  }

  summarize(track) {
    const stats = {
      track: track,
      played: 0,
      lastPlayed: null,
    }

    const records = this.#rs.filter((v) => v.track === track)

    stats.played += records.length

    for (const record of records) {
      const ms = record.start.getMilliseconds()

      if (!Number.isNaN(ms)) {
        if (stats.lastPlayed == null) {
          stats.lastPlayed = record.start
        } else if (ms > stats.lastPlayed.getMilliseconds()) {
          stats.lastPlayed = record.start
        }
      }
    }

    return stats
  }

  previousWeek(track) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()

    const stats = {
      track: track,
      total: 0,
      played: [
        { date: new Date(year, month, day - 6), played: 0 },
        { date: new Date(year, month, day - 5), played: 0 },
        { date: new Date(year, month, day - 4), played: 0 },
        { date: new Date(year, month, day - 3), played: 0 },
        { date: new Date(year, month, day - 2), played: 0 },
        { date: new Date(year, month, day - 1), played: 0 },
        { date: new Date(year, month, day), played: 0 },
      ],
    }

    const cutoff = new Date(year, month, day - 7)
    const records = this.#rs.filter((v) => v.track === track && v.start >= cutoff)

    stats.played.forEach((p) => {
      const yyyy = p.date.getFullYear()
      const mm = p.date.getMonth()
      const dd = p.date.getDate()

      const list = records.filter((v) => {
        return v.start.getFullYear() === yyyy && v.start.getMonth() === mm && v.start.getDate() === dd
      })

      p.played = list.length
    })

    stats.total = stats.played.reduce((N, v) => N + v.played, 0)

    return stats
  }

  onStart(e) {
    if (e.detail.track != null && e.detail.track !== '' && e.detail.track === this.#record.track) {
      console.error('*** unexpectedly looping ***')
    } else if (e.detail.track != null && e.detail.track !== '') {
      this.#clear()

      this.#record.UUID = UUIDv4().next().value
      this.#record.track = e.detail.track
      this.#record.start = new Date()
      this.#record.BPM = event.detail.BPM
    }
  }

  onStop(e) {
    if (e.detail.track == null || e.detail.track === '' || e.detail.track !== this.#record.track) {
      this.#clear()
      return
    }

    this.#record.end = new Date()

    save({ ...this.#record })

    this.#clear()
  }

  onClick(e) {
    if (e.detail.track != null && e.detail.track !== '' && e.detail.track === this.#record.track) {
      if (e.detail.playing) {
        this.#record.bars = e.detail.bar > 0 ? e.detail.bar : 0
      }
    }
  }

  onDone(e) {
    if (e.detail.track == null || e.detail.track === '' || e.detail.track !== this.#record.track) {
      this.#clear()
      return
    }

    this.#record.end = new Date()
    this.#record.complete = true

    save({ ...this.#record })

    this.#clear()
  }

  #clear() {
    this.#record.UUID = null
    this.#record.track = null
    this.#record.start = null
    this.#record.end = null
    this.#record.bars = 0
    this.#record.BPM = 0
    this.#record.complete = false
  }
}

const statistics = new Statistics()

export function restore() {
  engine.addEventListener(EVENTS.PLAYING, (event) => statistics.onStart(event), false)
  engine.addEventListener(EVENTS.STOPPED, (event) => statistics.onStop(event), false)
  engine.addEventListener(EVENTS.CLICK, (event) => statistics.onClick(event), false)
  engine.addEventListener(EVENTS.DONE, (event) => statistics.onDone(event), false)

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
