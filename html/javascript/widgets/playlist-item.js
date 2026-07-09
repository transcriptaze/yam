import * as datastore from '../datastore/datastore.js'
import { normaliseTag } from '../util.js'
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

    actions: {
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
        const popover = this.shadowRoot.querySelector('#actions')

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
        const popover = this.shadowRoot.querySelector('#actions')

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
        const popover = this.shadowRoot.querySelector('#actions')

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

    wav: {
      click: (event) => {
        const popover = this.shadowRoot.querySelector('#actions')

        event.stopPropagation()
        this.dispatchEvent(
          new CustomEvent(EVENTS.TRACK_WAV, {
            bubbles: true,
            composed: true,
            detail: { track: this.UUID },
          }),
        )
        popover.hidePopover()
      },
    },

    filter: {
      click: (event) => {
        event.stopPropagation()
      },
    },

    tags: {
      click: (event) => {
        event.stopPropagation()

        const tag = event.target.closest('.tag')

        const next = {
          ignore: 'include',
          include: 'exclude',
          exclude: 'ignore',
        }

        if (tag) {
          tag.dataset.state = next[tag.dataset.state] ?? 'ignore'

          // ... update track filter
          const tags = this.shadowRoot.querySelectorAll('#tags div.tag')
          const include = new Set()
          const exclude = new Set()

          ;[...tags].forEach((t) => {
            if (t.dataset.state === 'include' && t.dataset.tag && t.dataset.tag !== '') {
              include.add(t.dataset.tag)
            }

            if (t.dataset.state === 'exclude' && t.dataset.tag && t.dataset.tag !== '') {
              exclude.add(t.dataset.tag)
            }
          })

          datastore.tracks.filter(this.#UUID, [...include], [...exclude])
        }
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
    const wav = shadow.getElementById('wav')
    const filter = shadow.getElementById('filter')
    const actions = shadow.querySelector('#actions')
    const tags = shadow.querySelector('#tags')

    title.textContent = this.#title

    menu.addEventListener('click', this.#handlers.menu.click)
    actions.addEventListener('toggle', this.#handlers.actions.toggle)
    mute.addEventListener('click', this.#handlers.mute.click)
    statistics.addEventListener('click', this.#handlers.statistics.click)
    wav.addEventListener('click', this.#handlers.wav.click)
    filter.addEventListener('click', this.#handlers.filter.click)
    tags.addEventListener('click', this.#handlers.tags.click)

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

      const popover = this.shadowRoot.querySelector('#tags div')
      const all = datastore.tags.all
      const included = datastore.tags.included(UUID)
      const excluded = datastore.tags.excluded(UUID)
      const children = []

      for (const tag of all) {
        const template = document.getElementById('template-tag')
        const clone = document.importNode(template.content, true)
        const div = clone.querySelector('div.tag')
        const span = clone.querySelector('span')

        div.dataset.tag = `${tag}`

        if (included.includes(normaliseTag(`${tag}`))) {
          div.dataset.state = 'include'
        } else if (excluded.includes(normaliseTag(`${tag}`))) {
          div.dataset.state = 'exclude'
        } else {
          div.dataset.state = 'ignore'
        }

        span.innerText = `${tag}`

        children.push(clone)
      }

      popover.replaceChildren(...children)
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
    const popover = shadow.querySelector('#actions')

    if (v === true) {
      this.classList.add('deleting')
    } else {
      this.classList.remove('deleting')
      popover.hidePopover()
    }
  }
}

customElements.define('yam-playlist-item', PlaylistItem)
