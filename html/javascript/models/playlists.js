import * as DB from '../db/db.js'
import { Playlist } from './playlist.js'
import { warnf } from '../log.js'
import { UUIDv4 } from '../uuid.js'
import { DEFAULT, EVENTS } from '../constants.js'

const LOGTAG = 'playlists'

class Playlists extends EventTarget {
  #playlists = []

  constructor() {
    super()
  }

  get object() {
    return this.#playlists.map((v) => v.object)
  }

  get playlists() {
    return this.#playlists.filter((v) => !v.deleted)
  }

  set playlists(playlists) {
    this.#playlists = playlists.toSorted((a, b) => {
      const p = a.index ?? 1000000
      const q = b.index ?? 1000000
      return p - q
    })

    playlists.forEach((v) => {
      v.addEventListener(EVENTS.PLAYLIST_SELECTED, this.#forward)
      v.addEventListener(EVENTS.PLAYLIST_CHANGED, this.#forward)
      v.addEventListener(EVENTS.PLAYLIST_TRACK_DELETED, this.#forward)
      v.addEventListener(EVENTS.PLAYLIST_TRACK_MUTED, this.#forward)
      v.addEventListener(EVENTS.PLAYLIST_TRACK_UNMUTED, this.#forward)
    })
  }

  create() {
    const playlists = this.#playlists
    let ix = playlists.length + 1
    while (playlists.some((v) => normalise(v.title) === `playlist${ix}`)) {
      ix++
    }

    const uuid = UUIDv4().next().value
    const title = `Playlist #${ix}`
    const indices = this.#playlists.filter((v) => !v.deleted).map((v) => v.index)
    const index = Math.max(1, ...indices)

    const playlist = new Playlist({
      UUID: uuid,
      index: index < Number.MAX_SAFE_INTEGER ? index + 1 : Number.MAX_SAFE_INTEGER,
      title: title,
    })

    playlist.addEventListener(EVENTS.PLAYLIST_SELECTED, this.#forward)
    playlist.addEventListener(EVENTS.PLAYLIST_CHANGED, this.#forward)
    playlist.addEventListener(EVENTS.PLAYLIST_TRACK_DELETED, this.#forward)
    playlist.addEventListener(EVENTS.PLAYLIST_TRACK_MUTED, this.#forward)
    playlist.addEventListener(EVENTS.PLAYLIST_TRACK_UNMUTED, this.#forward)

    this.#playlists.push(playlist)
    this.save()

    this.dispatchEvent(new CustomEvent('added', { detail: { playlist: playlist.UUID } }))
  }

  delete(UUID) {
    const playlist = this.#playlists.find((v) => `${v.UUID}` === `${UUID}`)
    if (playlist != null) {
      playlist.delete()

      this.save()
      this.dispatchEvent(new CustomEvent('deleted', { detail: { playlist: UUID } }))
    }
  }

  playlist(UUID) {
    return this.#playlists.find((e) => `${e.UUID}` === `${UUID}`)
  }

  has(track) {
    return this.#playlists.some((v) => v.has(track))
  }

  tracks() {
    return this.#playlists.flatMap((v) => v.tracks)
  }

  restore() {
    return Promise.all([DB.playlists(), DB.tracks()]).then(([playlists, tracks]) => {
      this.load(playlists, tracks)

      return this.playlists
    })
  }

  load(_playlists, _tracks) {
    const playlists = _playlists.map((o) => new Playlist(o))
    const tracks = new Set(_tracks.map((v) => v.UUID))

    let deflist = playlists.find((v) => v.UUID === DEFAULT.UUID)
    if (deflist == null) {
      deflist = new Playlist({
        UUID: DEFAULT.UUID,
        title: 'All Tracks',
      })
    }

    deflist.tracks = [...new Set(deflist.tracks).union(tracks)]

    this.playlists = [deflist, ...playlists.filter((v) => v.UUID !== DEFAULT.UUID)]
  }

  save() {
    const objects = this.#playlists.map((v) => v.object)

    DB.putPlaylists(objects)
  }

  prune(tracks) {
    // ... playlists
    const pruned = []

    this.#playlists.forEach((v) => {
      if (v.deleted && v.expired) {
        pruned.push(v)
      }
    })

    pruned.forEach((v) => {
      const ix = this.#playlists.findIndex((e) => `${e.UUID}` === `${v.UUID}`)
      if (ix !== -1) {
        this.#playlists.splice(ix, 1)
        warnf(LOGTAG, `deleting playlist ${v.title} (past use-by date)`)
      }
    })

    if (pruned.length > 0) {
      this.save()
    }

    // ... tracks
    const list = tracks.map((v) => v.UUID)

    this.#playlists.forEach((v) => v.prune(list))
  }

  shuffled(playlists) {
    const index = new Map(playlists.map((uuid, ix) => [uuid, ix]))

    this.#playlists.forEach((v) => {
      v.index = index.get(v.UUID) ?? Number.MAX_SAFE_INTEGER
    })

    this.save()
  }

  #forward = (event) => {
    this.dispatchEvent(new CustomEvent(event.type, { detail: event.detail }))
  }
}

function normalise(v) {
  return v
    .trim()
    .toLowerCase()
    .replace(/[\W_]+/g, '')
}

export const playlists = new Playlists()
