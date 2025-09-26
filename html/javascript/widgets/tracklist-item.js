export class TrackListItem extends HTMLElement {
  static get observedAttributes() {
    return ['uuid', 'title', 'selected']
  }

  #UUID = ''

  constructor() {
    super()

    const template = document.getElementById('template-tracklist-item')
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
    this.classList.add('component-tracklist-item')
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, _from, to) {
    if (name === 'uuid') {
      this.UUID = to
    }

    if (name === 'title') {
      this.title = to
    }

    if (name === 'selected') {
      // TODO
    }
  }

  get UUID() {
    return this.#UUID
  }

  set UUID(v) {
    this.#UUID = v == null ? '' : `${v}`
  }

  set title(v) {
    const shadow = this.shadowRoot
    const title = shadow.querySelector('#title')

    title.innerHTML = v == null ? '' : `${v}`
  }

  get selected() {
    const shadow = this.shadowRoot
    const checkbox = shadow.querySelector('input[type="checkbox"]')

    return checkbox.checked
  }

  set selected(v) {
    const shadow = this.shadowRoot
    const checkbox = shadow.querySelector('input[type="checkbox"]')

    checkbox.checked = v === true
  }

  update(track) {
    this.title = track.title
  }
}

customElements.define('yam-tracklist-item', TrackListItem)
