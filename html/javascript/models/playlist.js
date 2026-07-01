import * as DB from '../db/db.js'
import { UUIDv4 } from '../uuid.js'
import { infof } from '../log.js'
import { EVENTS, RANDOM } from '../constants.js'
import * as models from './models.js'

const LOGTAG = 'playlist'
const VERSION = 0
const RETENTION = 30 // days

export class Playlist extends EventTarget {
  #version = VERSION
  #index = Number.MAX_SAFE_INTEGER
  #deleted = null

  #title = ''
  #tracks = []
  #random = []
  #muted = new Set()
  #selected = null
  #track = null

  static clone(playlist) {
    return new Playlist({
      UUID: playlist.UUID,
      title: playlist.title,
      tracks: [...playlist.tracks],
      random: [...playlist.random],
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
    this.#random = object.random == null ? [] : object.random
    this.#muted = object.muted == null ? new Set() : new Set([...object.muted])
  }

  get object() {
    const random = this.#random.map((v) => {
      return {
        UUID: v.UUID,
        title: v.title,
        filter: v.filter ?? {
          include: [],
          exclude: [],
        },
      }
    })

    // NTS: clone arrays to prevent external mutation of private fields
    const object = {
      UUID: this.UUID,
      version: this.#version,
      index: this.#index,
      deleted: this.#deleted,

      title: this.title,
      tracks: [...this.#tracks],
      random: random,
      muted: [...this.#muted],
    }

    return object
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

      this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_CHANGED, { detail: { playlist: this.UUID } }))
    }
  }

  get tracks() {
    return this.#tracks
  }

  set tracks(v) {
    this.#tracks = v ?? []

    this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_CHANGED, { detail: { playlist: this.UUID } }))
  }

  add(...tracks) {
    for (const track of tracks) {
      switch (true) {
        // ... random track ?
        case track.UUID === RANDOM.UUID:
          {
            const _track = {
              UUID: UUIDv4().next().value,
              title: '<< random >>',
              filter: {
                include: [],
                exclude: [],
              },
            }

            this.#random.push(_track)
            this.#tracks.push(_track.UUID)
          }
          break

        // ... new track?
        case track.UUID != null && track.UUID !== '' && !models.tracks.has(track.UUID):
          {
            const _track = models.tracks.create({
              UUID: track.UUID,
            })

            this.#tracks.push(_track.UUID)
          }
          break

        // ... normal track
        case track.UUID != null && track.UUID !== '' && !this.tracks.includes(track.UUID):
          this.#tracks.push(track.UUID)
          break
      }
    }

    this.save()

    this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_CHANGED, { detail: { playlist: this.UUID } }))
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

    this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_CHANGED, { detail: { playlist: this.UUID } }))
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
    return this.#tracks.some((v) => v === track)
  }

  // NTS: returns true if the uuid matches an internal 'random' track
  internal(uuid) {
    return this.#random.some((v) => v.UUID === uuid)
  }

  shuffled(tracks) {
    this.#tracks = tracks
    this.save()
  }

  prune(tracks) {
    // ... tracks
    let pruned = false
    {
      const invalid = this.#tracks.filter((v) => {
        const ix = tracks.findIndex((t) => t === v)
        const jx = this.#random.findIndex((t) => t.UUID === v)

        return ix === -1 && jx === -1
      })

      for (const track of invalid) {
        const ix = this.#tracks.findIndex((e) => `${e}` === `${track}`)
        if (ix !== -1) {
          this.#tracks.splice(ix, 1)
          pruned = true
        }
      }
    }

    // ... random
    {
      const invalid = [...this.#random].filter((v) => {
        const ix = this.#tracks.findIndex((t) => t === v.UUID)

        return ix === -1
      })

      for (const track of invalid) {
        const ix = this.#random.findIndex((e) => `${e.UUID}` === `${track.UUID}`)
        if (ix !== -1) {
          this.#random.splice(ix, 1)
          pruned = true
        }
      }
    }

    // ... muted
    {
      const invalid = [...this.#muted].filter((v) => {
        const ix = tracks.findIndex((t) => t === v)
        const jx = this.#random.findIndex((t) => t.UUID === v)

        return ix === -1 && jx === -1
      })

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

  select(item) {
    let ok = true

    const f = () => {
      // ... random track ?
      const random = this.#random.find((t) => t.UUID === item)

      // ... already assigned ?
      if (random != null && random.track != null) {
        return random.track
      }

      // ... pick unused track
      if (random != null) {
        const tracks = new Set(models.tracks.tracks.map((v) => v.UUID))
        const used = new Set(this.#random.filter((v) => v.track != null).map((v) => v.track))
        const playlist = new Set([...this.#tracks, ...used])

        const difference = Array.from(tracks.difference(playlist))
        const N = difference.length
        const ix = Math.floor(N * Math.random())
        const track = N > 0 ? difference[ix] : this.#track

        random.track = N > 0 ? track : null
        ok = N > 0

        return track
      }

      return item
    }

    // ... normal
    this.#selected = item
    this.#track = f()

    this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_SELECTED, { detail: { playlist: this.UUID, item: item, track: this.#track } }))

    return ok
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

      while (!done) {
        while (!done && muted.has(value)) {
          ;({ value, done } = ix.next())
        }

        if (!done) {
          if (this.select(value)) {
            return
          } else {
            ;({ value, done } = ix.next())
          }
        }
      }
    }

    if (this.selected == null) {
      g()
    } else if (ix.find((v) => v === this.selected) != null) {
      g()
    } else {
      g()
    }
  }

  mute(track) {
    if (track != null && this.#tracks.includes(track)) {
      this.#muted.add(track)
      this.save()
      this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_TRACK_MUTED, { detail: { playlist: this.UUID, track: track } }))
    }
  }

  unmute(track) {
    if (track != null && this.#tracks.includes(track)) {
      this.#muted.delete(track)
      this.save()
      this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_TRACK_UNMUTED, { detail: { playlist: this.UUID, track: track } }))
    }
  }

  get BOF() {
    let UUID = this.selected ?? ''

    if (UUID === '') {
      return true
    } else {
      const index = this.#tracks.findIndex((v) => v === UUID)

      return index !== -1 ? index === 0 : null
    }
  }

  get EOF() {
    let UUID = this.selected ?? ''

    if (UUID === '') {
      return this.#tracks.length == 0
    } else {
      const index = this.#tracks.findIndex((v) => v === UUID)

      return index !== -1 ? index + 1 === this.#tracks.length : null
    }
  }

  remove(track) {
    const ix = this.#tracks.findIndex((e) => `${e}` === `${track}`)
    if (ix !== -1) {
      this.#tracks.splice(ix, 1)

      if (this.#selected === track) {
        this.#selected = null
        this.#track = null
      }

      this.save()
      this.dispatchEvent(new CustomEvent(EVENTS.PLAYLIST_TRACK_DELETED, { detail: { playlist: this.UUID, track: track } }))
    }
  }

  delete() {
    this.#deleted ??= Date.now()

    return this
  }

  save() {
    DB.putPlaylist(this.object)
  }
}
