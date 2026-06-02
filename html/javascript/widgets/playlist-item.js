import { EVENTS } from '../constants.js'

export class PlaylistItem extends HTMLElement {
  static get observedAttributes() {
    return ['uuid', 'title']
  }

  #UUID = ''
  #title = ''
  #muted = false

  #handlers = {
    menu: {
      click: (event) => {
        event.stopPropagation()
      },
    },

    popover: {
      toggle: (event) => {
        const trash = this.shadowRoot.getElementById('trash')

        if (event.newState === 'open') {
          this.classList.remove('deleting')
          trash.classList.remove('locked')
        }

        if (event.newState === 'closed') {
          this.classList.remove('deleting')
        }
      },
    },

    mute: {
      click: (event) => {
        const popover = this.shadowRoot.querySelector('div [popover]')

        event.stopPropagation()
        this.dispatchEvent(
          new CustomEvent(EVENTS.TRACK_MUTE, {
            bubbles: true,
            composed: true,
            detail: { UUID: this.UUID, mute: !this.muted },
          }),
        )
        popover.hidePopover()
      },
    },

    trash: {
      click: (event) => {
        const trash = this.shadowRoot.getElementById('trash')
        const popover = this.shadowRoot.querySelector('div [popover]')

        event.stopPropagation()

        if (this.classList.contains('deleting') && !trash.classList.contains('locked')) {
          popover.hidePopover()

          this.dispatchEvent(
            new CustomEvent(EVENTS.TRACK_DELETE, {
              bubbles: true,
              composed: true,
              detail: { track: this.UUID },
            }),
          )
        } else {
          this.classList.add('deleting')
          trash.classList.add('locked')
        }
      },

      transitionEnd: (event) => {
        const trash = this.shadowRoot.getElementById('trash')

        if (event.propertyName === 'filter') {
          trash.classList.remove('locked')
        }
      },
    },

    statistics: {
      click: (event) => {
        const popover = this.shadowRoot.querySelector('div [popover]')

        event.stopPropagation()
        this.dispatchEvent(
          new CustomEvent(EVENTS.TRACK_STATISTICS, {
            bubbles: true,
            composed: true,
            detail: { track: this.UUID },
          }),
        )
        popover.hidePopover()
      },
    },

    ogg: {
      click: (event) => {
        const popover = this.shadowRoot.querySelector('div [popover]')

        event.stopPropagation()
        this.dispatchEvent(
          new CustomEvent(EVENTS.TRACK_OGG, {
            bubbles: true,
            composed: true,
            detail: { track: this.UUID },
          }),
        )
        popover.hidePopover()
      },
    },
  }

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
    const statistics = shadow.getElementById('statistics')
    const ogg = shadow.getElementById('ogg')
    const popover = shadow.querySelector('div [popover]')

    title.textContent = this.#title

    menu.addEventListener('click', this.#handlers.menu.click)
    popover.addEventListener('toggle', this.#handlers.popover.toggle)
    mute.addEventListener('click', this.#handlers.mute.click)
    statistics.addEventListener('click', this.#handlers.statistics.click)
    ogg.addEventListener('click', this.#handlers.ogg.click)

    trash.addEventListener('click', this.#handlers.trash.click)
    trash.addEventListener('transitionend', this.#handlers.trash.transitionEnd)
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

  set track({ UUID, title, muted, selected, random }) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('.playlist-track')

    this.UUID = UUID
    this.title = title
    this.muted = muted
    this.selected = selected

    if (random === true) {
      container.classList.add('random')
    } else {
      container.classList.remove('random')
    }
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
    title.textContent = this.#title
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
