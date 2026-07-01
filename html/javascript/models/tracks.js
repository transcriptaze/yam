import * as DB from '../db/db.js'
import { UUIDv4 } from '../uuid.js'
import { Track } from './track.js'
import * as generators from '../generators.js'

class Tracks extends EventTarget {
  #tracks = []
  #titles = generators.titles(Math.floor(Math.random() * 11))

  constructor() {
    super()
  }

  get object() {
    return this.tracks.map((v) => v.object)
  }

  get tracks() {
    return this.#tracks.filter((v) => !v.deleted)
  }

  get tags() {
    // ... get all tags
    const tags = this.#tracks.reduce((list, track) => {
      if (track.tags) {
        list.push(...track.tags)
      }

      return list
    }, [])

    // ... unique and count
    const map = tags.reduce((m, t) => {
      const key = t.trim().toLowerCase()
      const tag = m.has(key) ? m.get(key) : { tag: t, count: 0 }

      m.set(key, { tag: tag.tag, count: tag.count + 1 })

      return m
    }, new Map())

    // ... sort by count (descending)
    return [...map.values()].sort((p, q) => q.count - p.count).map((v) => v.tag)
  }

  has(UUID) {
    return this.#tracks.findIndex((v) => `${v.UUID}` === `${UUID}` && !v.deleted) != -1
  }

  track(UUID) {
    return this.#tracks.find((v) => `${v.UUID}` === `${UUID}` && !v.deleted)
  }

  restore() {
    return DB.tracks().then((list) => {
      this.load(list)

      return this.tracks
    })
  }

  load(list) {
    const f = (o) => {
      return new Track(o)
    }

    this.#tracks = list.map((o) => f(o)).filter((t) => t != null)
  }

  create(object) {
    const track = new Track({
      UUID: object?.UUID ?? UUIDv4().next().value,
      title: object?.title ?? this.#titles(),
      tempo: object?.BPM ?? 120,
      timeSignature: object?.timeSignature ?? '4:4',
      pulse: object?.pulse ?? 'quarter',
      metronome: {
        BPM: object?.BPM ?? 120,
      },
    })

    DB.putTrack(track.object)
    this.#tracks.push(track)

    return track
  }

  save() {
    const objects = this.tracks.map((v) => v.object)

    DB.putTracks(objects)
  }

  remove(UUID) {
    // prettier-ignore
    this.#tracks.find((e) => `${e.UUID}` === UUID)?.delete().save()
  }

  prune(playlists) {
    const inuse = playlists.tracks()
    const unused = this.#tracks.filter((v) => !inuse.includes(v.UUID))

    unused.forEach((track) => track.prune())
  }
}

export const tracks = new Tracks()
