import { RANDOM } from '../constants.js'

export class TrackList extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #tracks = new Map()

  constructor() {
    super()

    const template = document.querySelector('#template-tracklist')
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
    this.classList.add('component-tracklist')
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set tracks(tracks) {
    this.#tracks = new Map(tracks.map((v) => [v.UUID, v]))

    // ... initialise tracklist <ul>
    const ul = this.shadowRoot.querySelector('div.tracklist > ul')
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
    const items = this.shadowRoot.querySelector('div.tracklist > ul')?.querySelectorAll('yam-tracklist-item') ?? []
    const random = this.shadowRoot.querySelector('div.random > ul').querySelectorAll('yam-tracklist-item') ?? []
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

    random.forEach((v) => {
      if (v.selected) {
        const UUID = v.getAttribute('uuid')

        selected.push({
          UUID: UUID,
          title: RANDOM.title,
        })
      }
    })

    return selected
  }

  set selected(tracks) {
    // ... tick/untick tracks
    const tracklist = this.shadowRoot.querySelector('div.tracklist > ul')
    const items = tracklist?.querySelectorAll('yam-tracklist-item') ?? []
    const set = new Set(tracks.filter((v) => v.random !== true).map((v) => v.UUID))

    items.forEach((v) => {
      v.selected = set.has(v.getAttribute('uuid'))
    })

    // ... populate the random tracks list
    const random = tracks.filter((v) => v.random === true)
    const div = this.shadowRoot.querySelector('div.random')
    const ul = div?.querySelector('ul')
    const list = []

    if (random != null && random.length > 0) {
      div?.classList.remove('hide')
    } else {
      div?.classList.add('hide')
    }

    if (random != null && random.length > 0) {
      random.forEach((v) => {
        const li = document.createElement('li')
        const item = document.createElement('yam-tracklist-item')

        item.setAttribute('uuid', v.UUID)
        item.setAttribute('title', v.title)
        item.selected = true

        li.appendChild(item)
        list.push(li)
      })
    }

    ul?.replaceChildren(...list)
  }

  updated(track) {
    // ... update internal list
    if (this.#tracks != null && this.#tracks.has(track?.UUID)) {
      this.#tracks.set(track.UUID, track)
    }

    // ... updated displayed tracks
    const items = this.shadowRoot.querySelectorAll('yam-tracklist-item').values()

    items.filter((v) => v.getAttribute('uuid') === track.UUID).forEach((v) => v.update(track))
  }
}

customElements.define('yam-tracklist', TrackList)
