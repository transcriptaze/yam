import * as DB from '../db/db.js'
import { UUIDv4, reserve } from '../uuid.js'
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

    reserve(this.#tracks.map((v) => v.UUID))
  }

  create(object) {
    const uuid = UUIDv4().next().value
    const track = new Track({
      UUID: uuid,
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
