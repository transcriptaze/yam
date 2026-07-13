import { DEFAULT, EVENTS } from '../constants.js'

export class Playlists extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #playlists = []
  #selected = null
  #fields = {}

  #drag = {
    li: null,
    over: null,
    UUID: '',
    list: null,
    dropped: false,
  }

  #handlers = {
    plus: {
      click: (e) => {
        e.preventDefault()
        this.dispatchEvent(new CustomEvent('new', { detail: {} }))
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-playlists')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/widgets.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)
  }

  connectedCallback() {
    this.classList.add('component-playlists')

    this.shadowRoot.getElementById('all').addEventListener(EVENTS.TOGGLE_PLAYLIST, this.#toggle)
    this.shadowRoot.getElementById('plus').addEventListener('click', this.#handlers.plus.click)
  }

  disconnectedCallback() {
    this.#fields = {}
  }

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  get playlist() {
    const shadow = this.shadowRoot

    return shadow.querySelector('yam-playlist')
  }

  set tracklist(tracks) {
    const add_tracks = this.#add_tracks

    if (add_tracks != null) {
      add_tracks.tracks = tracks
    }
  }

  set selected({ playlist, track }) {
    this.#selected = playlist

    if (playlist != null) {
      const all = this.shadowRoot.getElementById('all')
      const ul = this.shadowRoot.querySelector('ul')
      const children = Array.from(ul.children).map((v) => v.querySelector('yam-playlist'))
      const list = [all, ...children]

      list.forEach((v) => {
        if (v.UUID !== playlist) {
          v.close()
          v.selected = null
        }
      })

      list.forEach((v) => {
        if (v.UUID === playlist) {
          v.open(this.#add_tracks)
          v.selected = track
        }
      })
    }
  }

  initialise(playlists, tracks) {
    const shadow = this.shadowRoot
    const all = playlists.find((v) => v.UUID === DEFAULT.UUID)
    const ul = shadow.querySelector('ul')

    // ... store playlistss
    this.#playlists = []

    if (all) {
      this.#playlists.push(transmogrify(all, tracks))
    }

    playlists
      .filter((v) => v.UUID !== DEFAULT.UUID)
      .forEach((v) => {
        this.#playlists.push(transmogrify(v, tracks))
      })

    // ...  'All Tracks'
    if (all) {
      shadow.getElementById('all').playlist = {
        playlist: this.#playlists[0],
        selected: this.#selected === DEFAULT.UUID,
      }
    }

    // ... user playlists
    const list = this.#playlists.filter((v) => v.UUID !== DEFAULT.UUID).map((v) => this.#create(v))

    ul.replaceChildren(...list)

    // ... track list
    this.tracklist = tracks
  }

  add(playlist, tracks) {
    const ul = this.shadowRoot.querySelector('ul')
    const div = this.shadowRoot.querySelector('div.playlists')

    // ... user playlist?
    if (playlist.UUID !== DEFAULT.UUID) {
      const p = transmogrify(playlist, tracks)
      const li = this.#create(p)

      this.#playlists.push(p)

      if (li) {
        ul.appendChild(li)
      }

      // NTS: new playlists are automatically opened
      div.classList.add('unsortable')
    }
  }

  update(playlist, tracks) {
    if (playlist != null) {
      const all = this.shadowRoot.getElementById('all')
      const ul = this.shadowRoot.querySelector('ul')
      const children = Array.from(ul.children).map((v) => v.querySelector('yam-playlist'))
      const lists = [all, ...children]

      const p = transmogrify(playlist, tracks)

      this.#playlists = this.#playlists.map((v) => (v.UUID === playlist.UUID ? p : v))

      lists
        .filter((v) => v.UUID === playlist.UUID)
        .forEach((e) => {
          e.playlist = {
            playlist: p,
            selected: p.UUID === this.#selected,
          }
        })
    }
  }

  updated(playlist, track) {
    const shadow = this.shadowRoot
    const ul = shadow.querySelector('ul')
    const all = shadow.getElementById('all')
    const children = Array.from(ul.children).map((v) => v.querySelector('yam-playlist'))
    const list = [all, ...children]

    list.forEach((v) => v.updated(track))
  }

  deleted(playlist) {
    let UUID = ''

    if (playlist != null && typeof playlist === 'string') {
      UUID = playlist
    } else if (playlist != null && typeof playlist === 'object' && playlist.constructor.name === 'Playlist') {
      UUID = playlist.UUID ?? ''
    }

    const shadow = this.shadowRoot
    const ul = shadow.querySelector('ul')
    const playlists = Array.from(ul.children).map((v) => v.querySelector('yam-playlist'))
    const e = playlists.find((v) => v.UUID === UUID)

    this.#playlists = this.#playlists.filter((v) => v.UUID !== UUID)

    if (e != null) {
      ul.removeChild(e.parentElement)
    }
  }

  mute(playlist, track, muted) {
    const shadow = this.shadowRoot
    const all = shadow.getElementById('all')
    const ul = shadow.querySelector('ul')
    const children = Array.from(ul.children).map((v) => v.querySelector('yam-playlist'))
    const list = [all, ...children]

    this.#playlists
      .filter((v) => v.UUID === playlist.UUID)
      .forEach((v) => {
        v.tracks
          .filter((u) => u.UUID === track.UUID)
          .forEach((u) => {
            u.muted = muted
          })
      })

    list.find((v) => v.UUID === playlist.UUID)?.muted(track, muted)
  }

  get #add_tracks() {
    if (this.#fields.add_tracks == null) {
      this.#fields.add_tracks = this.shadowRoot?.querySelector('yam-add-tracks')
    }

    return this.#fields.add_tracks
  }

  #create(playlist) {
    const li = document.createElement('li')
    const grip = document.createElement('div')
    const e = document.createElement('yam-playlist')

    li.setAttribute('draggable', false)

    grip.setAttribute('draggable', false)
    grip.classList.add('grip')
    grip.addEventListener('pointerdown', this.#onPointerDown)
    grip.addEventListener('pointerup', this.#onPointerUp)

    e.playlist = {
      playlist: playlist,
      selected: playlist.UUID === this.#selected,
    }

    e.addEventListener(EVENTS.TOGGLE_PLAYLIST, this.#toggle)

    li.appendChild(e)
    li.appendChild(grip)

    return li
  }

  #toggle = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const shadow = this.shadowRoot
    const all = shadow.getElementById('all')
    const ul = shadow.querySelector('ul')
    const children = Array.from(ul.children).map((v) => v.querySelector('yam-playlist'))
    const lists = [all, ...children]
    const UUID = event.detail.playlist

    if (event.detail.open) {
      lists.forEach((v) => {
        if (v.UUID !== UUID) {
          v.close()
        }
      })

      lists.forEach((v) => {
        if (v.UUID === UUID) {
          v.open(this.#add_tracks)
        }
      })

      this.dispatchEvent(new CustomEvent(EVENTS.SELECT_PLAYLIST, { detail: { playlist: UUID } }))
    }

    // ... enable/disable drag
    const div = shadow.querySelector('div.playlists')
    const sortable = lists.every((v) => v.isopen === false)

    if (sortable) {
      div.classList.remove('unsortable')

      Array.from(ul.children).forEach((li) => {
        li.addEventListener('dragover', this.#dragover, { capture: true })
        li.addEventListener('dragstart', this.#dragstart, { capture: true })
        li.addEventListener('dragend', this.#dragend, { capture: true })
        li.addEventListener('dragleave', this.#dragleave, { capture: true })
        li.addEventListener('drop', this.#drop, { capture: true })
      })
    } else {
      div.classList.add('unsortable')

      Array.from(ul.children).forEach((li) => {
        li.removeEventListener('dragover', this.#dragover, { capture: true })
        li.removeEventListener('dragstart', this.#dragstart, { capture: true })
        li.removeEventListener('dragend', this.#dragend, { capture: true })
        li.removeEventListener('dragleave', this.#dragleave, { capture: true })
        li.removeEventListener('drop', this.#drop, { capture: true })
      })
    }
  }

  #onPointerDown = (event) => {
    const li = event.currentTarget.parentElement

    li.setAttribute('draggable', true)
  }

  #onPointerUp = (event) => {
    const li = event.currentTarget.parentElement

    li.setAttribute('draggable', false)
  }

  // Ref. https://stackoverflow.com/questions/10588607/tutorial-for-html5-dragdrop-sortable-list
  #dragstart = (event) => {
    const li = event.currentTarget
    const playlist = li.querySelector('yam-playlist')

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', playlist.UUID)

    this.#drag.li = li
    this.#drag.over = li
    this.#drag.UUID = playlist.UUID
    this.#drag.list = this.#playlists.slice(1)
    this.#drag.dropped = false
  }

  #dragend = (_event) => {
    // ... revert to playlist if dragend without drop
    if (!this.#drag.dropped) {
      Promise.resolve().then(() => {
        const shadow = this.shadowRoot
        const ul = shadow.querySelector('ul')
        const children = Array.from(ul.children)
        const playlists = this.#playlists.slice(1)

        // NTS: this could be so much neater if Safari did web components properly
        playlists.forEach((e, index) => {
          const playlist = children[index].querySelector('yam-playlist')
          if (playlist.UUID !== e.UUID) {
            playlist.playlist = {
              playlist: e,
              selected: e.UUID === this.#selected,
            }
          }
        })
      })
    }

    // ... clean up
    this.#drag.li.setAttribute('draggable', false)
    this.#drag.li = null
    this.#drag.over = null
    this.#drag.UUID = ''
    this.#drag.list = null
    this.#drag.dropped = false
  }

  #dragover = (event) => {
    event.preventDefault() // NTS: needed for drop to fire.
    event.dataTransfer.dropEffect = 'move'

    const li = event.target.closest('li')

    if (li !== this.#drag.over) {
      const rect = li.getBoundingClientRect()
      const top = rect.top + 0.2 * rect.height
      const bottom = rect.top + 0.8 * rect.height

      if (event.clientY > top && event.clientY < bottom) {
        this.#drag.over = li

        Promise.resolve().then(() => {
          const shadow = this.shadowRoot
          const ul = shadow.querySelector('ul')
          const children = Array.from(ul.children)
          const ix = this.#drag.list.findIndex((v) => v.UUID === this.#drag.UUID)
          const jx = children.indexOf(li)

          if (ix !== -1 && jx !== -1 && ix !== jx) {
            ;[this.#drag.list[ix], this.#drag.list[jx]] = [this.#drag.list[jx], this.#drag.list[ix]]

            // NTS: this could be so much neater if Safari did web components properly
            this.#drag.list.forEach((e, index) => {
              const playlist = children[index].querySelector('yam-playlist')

              if (playlist.UUID !== e.UUID) {
                playlist.playlist = {
                  playlist: e,
                  selected: e.UUID === this.#selected,
                }
              }
            })
          }
        })
      }
    }
  }

  #dragleave = (_event) => {}

  #drop = (_event) => {
    const lists = this.#drag.list.map((v) => v.UUID)

    this.dispatchEvent(
      new CustomEvent(EVENTS.SHUFFLE_PLAYLISTS, {
        bubbles: true,
        composed: true,
        detail: {
          playlists: lists,
        },
      }),
    )

    this.#drag.dropped = true
  }
}

function transmogrify(playlist, tracks) {
  const muted = playlist.muted
  const m = new Map(tracks.map((track) => [track.UUID, track]))

  const title = (UUID) => {
    // eslint-disable-next-line no-irregular-whitespace
    return `« ${playlist.internal(UUID)?.title ?? 'random'} »`
  }

  return {
    UUID: playlist.UUID,
    title: playlist.title,
    tracks: playlist.tracks
      .filter((uuid) => m.has(uuid) || playlist.internal(uuid))
      .map((uuid) => (m.has(uuid) ? m.get(uuid) : { UUID: uuid, title: title(uuid), random: true }))
      .map((v) => {
        return { UUID: `${v.UUID}`, title: `${v.title}`, muted: muted.includes(v.UUID), random: v.random }
      }),
  }
}

customElements.define('yam-playlists', Playlists)
