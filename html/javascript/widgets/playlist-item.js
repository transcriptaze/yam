import { EVENTS } from '../constants.js'

export class PlaylistItem extends HTMLElement {
  static get observedAttributes() {
    return ['uuid', 'title']
  }

  #UUID = ''
  #title = ''
  #muted = false

  constructor() {
    super()

    const template = document.getElementById('template-playlist-item')
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
    const shadow = this.shadowRoot
    const title = shadow.getElementById('title')
    const menu = shadow.getElementById('menu')
    const mute = shadow.getElementById('mute')
    const trash = shadow.getElementById('trash')
    const popover = shadow.querySelector('div [popover]')

    title.innerHTML = this.#title

    menu.addEventListener('click', (event) => {
      event.stopPropagation()
    })

    popover.addEventListener('toggle', (event) => {
      if (event.newState === 'open') {
        this.classList.remove('deleting')
        trash.classList.remove('locked')
      }

      if (event.newState === 'closed') {
        this.classList.remove('deleting')
      }
    })

    mute.addEventListener('click', (event) => {
      event.stopPropagation()
      this.dispatchEvent(
        new CustomEvent(EVENTS.MUTE_TRACK, {
          bubbles: true,
          composed: true,
          detail: { UUID: this.UUID, mute: !this.muted },
        }),
      )
      popover.hidePopover()
    })

    trash.addEventListener('click', (event) => {
      event.stopPropagation()

      if (this.classList.contains('deleting') && !trash.classList.contains('locked')) {
        this.dispatchEvent(
          new CustomEvent(EVENTS.DELETE_TRACK, {
            bubbles: true,
            composed: true,
            detail: { track: this.UUID },
          }),
        )
      } else {
        this.classList.add('deleting')
        trash.classList.add('locked')
      }
    })

    trash.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'filter') {
        trash.classList.remove('locked')
      }
    })
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, _from, to) {
    if (name === 'uuid') {
      this.#UUID = to
    }

    if (name === 'title') {
      this.#title = to
    }
  }

  set track({ UUID, title, muted, selected }) {
    this.UUID = UUID
    this.title = title
    this.muted = muted
    this.selected = selected
  }

  get UUID() {
    return this.#UUID
  }

  set UUID(v) {
    this.#UUID = v == null ? '' : `${v}`
  }

  get title() {
    return this.#title
  }

  set title(v) {
    const shadow = this.shadowRoot
    const title = shadow.querySelector('#title')

    this.#title = v == null ? '' : `${v}`
    title.innerHTML = this.#title
  }

  get muted() {
    return this.#muted
  }

  set muted(v) {
    this.#muted = v === true ? true : false

    if (this.muted) {
      this.classList.add('muted')
    } else {
      this.classList.remove('muted')
    }
  }

  set selected(v) {
    if (v === true) {
      this.classList.add('selected')
    } else {
      this.classList.remove('selected')
    }
  }

  set deleting(v) {
    const shadow = this.shadowRoot
    const popover = shadow.querySelector('div [popover]')

    if (v === true) {
      this.classList.add('deleting')
    } else {
      this.classList.remove('deleting')
      popover.hidePopover()
    }
  }
}

customElements.define('yam-playlist-item', PlaylistItem)
