import * as datastore from '../datastore/datastore.js'
import { EVENTS } from '../constants.js'

export class AddTracks extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #tracks = new Map()

  #fields = {}

  #handlers = {
    new_track: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.dispatchEvent(new CustomEvent(EVENTS.NEW_TRACK, { bubbles: true, composed: true, detail: {} }))
      },
    },

    random_track: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.dispatchEvent(new CustomEvent(EVENTS.RANDOM_TRACK, { bubbles: true, composed: true, detail: {} }))
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-add-tracks')
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
    this.classList.add('component-add-tracks')

    this.#new_track.addEventListener('click', this.#handlers.new_track.click)
    this.#random_track.addEventListener('click', this.#handlers.random_track.click)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set tracks(tracks) {
    this.#tracks = new Map(tracks.map((v) => [v.UUID, v]))

    // ... initialise <ul>
    const ul = this.shadowRoot.querySelector('ul')
    const list = []

    const clean = (v) => `${v}`.toLowerCase().replace(/\s+/g, '')

    const compare = (a, b) => {
      const p = clean(a.title)
      const q = clean(b.title)

      return Math.sign(p.localeCompare(q))
    }

    tracks.toSorted(compare).forEach((v) => {
      const li = document.createElement('li')
      const item = document.createElement('yam-tracklist-item')

      item.setAttribute('uuid', v.UUID)
      item.setAttribute('title', v.title)

      li.appendChild(item)
      list.push(li)
    })

    ul.replaceChildren(...list)
  }

  get selected() {
    const shadow = this.shadowRoot
    const items = shadow.querySelectorAll('yam-tracklist-item')
    const selected = []

    items.forEach((v) => {
      if (v.selected) {
        const UUID = v.getAttribute('uuid')
        const track = this.#tracks.get(UUID)

        if (track != null) {
          selected.push(track)
        }
      }
    })

    return selected
  }

  set selected(tracks) {
    const set = new Set(tracks.map((v) => v.UUID))

    const ul = this.shadowRoot.querySelector('ul')
    const hr = this.shadowRoot.querySelector('hr')
    const list = Array.from(ul.querySelectorAll('yam-tracklist-item'))
    let count = 0

    list.forEach((v) => {
      const uuid = v.getAttribute('uuid')
      const li = v.parentElement

      v.selected = false

      if (set.has(uuid)) {
        li.classList.add('hidden')
      } else {
        li.classList.remove('hidden')
        count++
      }
    })

    if (count == 0) {
      hr.classList.add('hide')
    } else {
      hr.classList.remove('hide')
    }
  }

  set playlist(playlist) {
    this.tracks = datastore.tracks.list()
    this.selected = datastore.playlists.get(playlist)?.tracks ?? []
  }

  get #new_track() {
    if (this.#fields.new_track == null) {
      this.#fields.new_track = this.shadowRoot?.querySelector('#new-track')
    }

    return this.#fields.new_track
  }

  get #random_track() {
    if (this.#fields.random_track == null) {
      this.#fields.random_track = this.shadowRoot?.querySelector('#random-track')
    }

    return this.#fields.random_track
  }
}

customElements.define('yam-add-tracks', AddTracks)
