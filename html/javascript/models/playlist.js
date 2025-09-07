import * as DB from '../db.js'
import { infof } from '../log.js'

const LOGTAG = 'playlist'
const VERSION = 0
const RETENTION = 30 // days

export class Playlist extends EventTarget {
  #version = VERSION
  #index = Number.MAX_SAFE_INTEGER
  #deleted = null

  #title = ''
  #tracks = []
  #muted = new Set()
  #selected = null

  static clone(playlist) {
    return new Playlist({
      UUID: playlist.UUID,
      title: playlist.title,
      tracks: [...playlist.tracks],
    })
  }

  constructor(object) {
    super()

    this.UUID = object.UUID
    this.#version = VERSION
    this.#index = object.index ?? Number.MAX_SAFE_INTEGER
    this.#deleted = object.deleted ?? null

    this.#title = object.title == null ? '' : `${object.title}`.trim()
    this.#tracks = object.tracks == null ? [] : object.tracks
    this.#muted = object.muted == null ? new Set() : new Set([...object.muted])
  }

  get object() {
    return {
      UUID: this.UUID,
      version: this.#version,
      index: this.#index,
      deleted: this.#deleted,

      title: this.title,
      tracks: [...this.tracks],
      muted: [...this.#muted],
    }
  }

  get index() {
    return this.#index ?? Number.MAX_SAFE_INTEGER
  }

  set index(v) {
    this.#index = Number.parseInt(`${v}`) ?? Number.MAX_SAFE_INTEGER
  }

  get title() {
    return this.#title
  }

  set title(v) {
    const title = `${v}`.trim()

    if (title != this.title) {
      this.#title = title

      this.dispatchEvent(new CustomEvent('changed', { detail: { playlist: this.UUID } }))
    }
  }

  get tracks() {
    return this.#tracks
  }

  set tracks(v) {
    this.#tracks = v ?? []

    this.dispatchEvent(new CustomEvent('changed', { detail: { playlist: this.UUID } }))
  }

  update(title, tracks) {
    if (title != null) {
      this.#title = `${title}`.trim()
    }

    if (tracks != null) {
      const muted = this.#muted.intersection(new Set(tracks))

      this.#tracks = tracks
      this.#muted = new Set([...muted])
    }

    this.dispatchEvent(new CustomEvent('changed', { detail: { playlist: this.UUID } }))
  }

  get selected() {
    return this.#selected
  }

  get muted() {
    return [...this.#muted]
  }

  get deleted() {
    return this.#deleted != null
  }

  get expired() {
    if (this.deleted) {
      const ms = Date.now() - this.#deleted
      const seconds = ms / 1000
      const minutes = seconds / 60
      const hours = minutes / 60
      const days = hours / 24

      return days > RETENTION
    }

    return false
  }

  has(track) {
    return this.#tracks.some((v) => v.UUID === track)
  }

  select(track) {
    this.#selected = track
    this.dispatchEvent(new CustomEvent('selected', { detail: { playlist: this.UUID, track: track } }))
  }

  add(track) {
    if (track.UUID != null && track.UUID !== '' && !this.tracks.includes(track.UUID)) {
      this.tracks.push(track.UUID)
      this.dispatchEvent(new CustomEvent('changed', { detail: { playlist: this.UUID } }))
    }
  }

  remove(track) {
    const ix = this.#tracks.findIndex((e) => `${e}` === `${track}`)
    if (ix !== -1) {
      this.#tracks.splice(ix, 1)

      this.dispatchEvent(new CustomEvent('changed', { detail: { playlist: this.UUID } }))
    }
  }

  shuffled(tracks) {
    this.#tracks = tracks
    this.save()
  }

  prune(tracks) {
    // ... tracks
    let pruned = false
    {
      const invalid = this.#tracks.filter((v) => !tracks.includes(v))

      for (const track of invalid) {
        const ix = this.#tracks.findIndex((e) => `${e}` === `${track}`)
        if (ix !== -1) {
          this.#tracks.splice(ix, 1)
          pruned = true
        }
      }
    }

    // ... muted
    {
      const invalid = [...this.#muted].filter((v) => !tracks.includes(v))

      for (const track of invalid) {
        if (this.#muted.delete(`${track}`)) {
          pruned = true
        }
      }
    }

    if (pruned) {
      this.save()
      infof(LOGTAG, `pruned playlist '${this.title}'`)
    }
  }

  back() {
    const array = this.#tracks.toReversed()
    const ix = array.values()

    this.#next(ix)
  }

  next() {
    const array = [...this.#tracks]
    const ix = array.values()

    this.#next(ix)
  }

  #next(ix) {
    const muted = this.#muted

    const g = () => {
      let { value, done } = ix.next()

      while (!done && muted.has(value)) {
        ;({ value, done } = ix.next())
      }

      if (!done) {
        this.select(value)
      }
    }

    if (this.selected == null) {
      g()
    } else if (ix.find((v) => v === this.selected) != null) {
      g()
    }
  }

  mute(track) {
    if (track != null && this.#tracks.includes(track)) {
      this.#muted.add(track)

      this.dispatchEvent(new CustomEvent('muted', { detail: { playlist: this.UUID, track: track } }))
    }
  }

  unmute(track) {
    if (track != null && this.#tracks.includes(track)) {
      this.#muted.delete(track)

      this.dispatchEvent(new CustomEvent('unmuted', { detail: { playlist: this.UUID, track: track } }))
    }
  }

  delete() {
    this.#deleted ??= Date.now()

    return this
  }

  save() {
    DB.putPlaylist(this.object)
  }

  BOF(track) {
    const UUID = track?.UUID ?? ''
    const index = this.#tracks.findIndex((v) => v === UUID)

    return index !== -1 ? index === 0 : null
  }

  EOF(track) {
    const UUID = track?.UUID ?? ''

    if (UUID === '') {
      return this.#tracks.length == 0
    } else {
      const index = this.#tracks.findIndex((v) => v === UUID)

      return index !== -1 ? index + 1 === this.#tracks.length : null
    }
  }
}
