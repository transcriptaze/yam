import { engine } from '../audio/engine.js'
import { UUIDv4 } from '../uuid.js'
import * as datastore from '../datastore/datastore.js'
import * as DB from '../db/db.js'
import { EVENTS, INF } from '../constants.js'

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

    stats.played = records.reduce((a, v) => {
      if (v.measures === INF && v.bars > v.countIn + v.pickup) {
        return a + 1
      }

      if (v.measures !== INF && v.complete) {
        return a + 1
      }

      return a
    }, 0)

    if (stats.played > 0) {
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
    }

    return stats
  }

  previousWeek(track) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    const cutoff = new Date(year, month, day - 7)

    const records = this.#rs.filter((v) => v.track === track && v.start >= cutoff)
    const played = [...query(cutoff, records)]
    const total = played.reduce((N, v) => N + v.played, 0)

    return { track, total, played }
  }

  previousMonth(track) {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const day = now.getDate()
    const cutoff = new Date(year, month - 1, day)

    const records = this.#rs.filter((v) => v.track === track && v.start >= cutoff)
    const played = [...query(cutoff, records)]
    const total = played.reduce((N, v) => N + v.played, 0)

    return { track, total, played }
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

function* query(start, records) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1)

  while (date <= today) {
    const yyyy = date.getFullYear()
    const mm = date.getMonth()
    const dd = date.getDate()

    const rs = records.filter((v) => {
      return v.start.getFullYear() === yyyy && v.start.getMonth() === mm && v.start.getDate() === dd
    })

    const played = rs.reduce((a, v) => {
      if (v.measures === INF && v.bars > v.countIn + v.pickup) {
        return a + 1
      }

      if (v.measures !== INF && v.complete) {
        return a + 1
      }

      return a
    }, 0)

    yield { date: new Date(date), played: played }

    date.setDate(date.getDate() + 1)
  }
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
