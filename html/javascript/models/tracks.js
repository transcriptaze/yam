import * as DB from '../db/db.js'
import { UUIDv4 } from '../uuid.js'
import { Track } from './track.js'

class Tracks extends EventTarget {
  #tracks = []

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
      this.#tracks = list.map((o) => new Track(o))

      return this.tracks
    })
  }

  load(list) {
    const tracks = []
    for (const object of list) {
      try {
        const track = new Track(object)

        tracks.push(track)
      } catch (err) {
        console.error(err)
      }
    }

    this.#tracks = tracks
  }

  create() {
    const set = new Set(this.#tracks.map((v) => v.UUID))
    const uuid = UUIDv4(set).next().value
    const track = new Track({
      UUID: uuid,
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
