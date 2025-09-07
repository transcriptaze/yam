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
    stylesheet.setAttribute('href', '/css/web-components.css')

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

    // ... initialise <ul>
    const shadow = this.shadowRoot
    const ul = shadow.querySelector('ul')
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
    const shadow = this.shadowRoot
    const items = shadow.querySelectorAll('yam-tracklist-item')
    const set = new Set(tracks.map((v) => v.UUID))

    items.forEach((v) => {
      v.selected = set.has(v.getAttribute('uuid'))
    })
  }
}

customElements.define('yam-tracklist', TrackList)
