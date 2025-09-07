import { COLOURS, INF } from '../constants.js'
import * as generators from '../generators.js'

export class Info extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #track = {
    bars: 0,
    sections: new Map(),
  }

  #cache = {
    section: -1,
    bar: -1,
  }

  constructor() {
    super()

    const template = document.querySelector('#template-info')
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
    this.classList.add('component-info')

    this.#title.addEventListener('keypress', this.#handlers.title.keypress)
    this.#title.addEventListener('input', this.#handlers.title.input)
    this.#save.addEventListener('click', this.#handlers.save.click)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set track(track) {
    const sections = transmogrify(track)

    this.#track.sections = new Map(sections.map((v) => [v.ID, v]))
    this.#track.bars = sections.reduce((measures, section) => measures + section.measures, 0)

    if (this.#track.sections.size > 0) {
      const section = this.#track.sections.get(1)

      this.#container.classList.add('details')
      this.#text.classList.remove('playing')
      this.#section.innerHTML = section?.name ?? ''
      this.#bars = this.#track.bars

      this.style.setProperty('--text-color', '#222222')
      this.style.setProperty('--accent-color', `#00000000`)
    } else {
      this.#container.classList.remove('details')
    }
  }

  get title() {
    return `${this.#title.value}`.trim()
  }

  set title(v) {
    this.#title.value = `${v}`
  }

  set modified(v) {
    this.#save.disabled = v === true ? false : true
  }

  redraw(bar, { playing, section }) {
    const v = section ?? {
      ID: -1,
      name: '',
      measures: 0,
      start: 1,
      colour: '#ffffff00',
    }

    this.#redraw(bar, playing, v)
  }

  #redraw(bar, playing, _section) {
    const section = this.#track.sections.get(_section.ID) ?? this.#track.sections.get(1)

    if (_section.ID !== this.#cache.section) {
      this.#cache.section = _section.ID

      const name = section?.name ?? ''
      const colour = section?.colour ?? '#00000000'
      const text = COLOURS.get(section?.colour ?? '') ?? '#222222'

      // NB set the colour before setting the progress bar value/max
      if (!playing && this.#track.sections.size > 0) {
        this.style.setProperty('--accent-color', `#c0c0c040`)

        this.#text.classList.remove('playing')
        this.#section.innerHTML = name
      } else if (playing) {
        this.style.setProperty('--text-color', text)
        this.style.setProperty('--accent-color', colour)

        this.#text.classList.add('playing')
        this.#section.innerHTML = name
      }
    }

    if (!playing && this.#track.sections.size > 0) {
      this.#bars = this.#track.bars
      this.#progress.value = 0
      this.#progress.max = this.#track.bars
    } else if (bar != this.#cache.bar) {
      this.#cache.bar = bar

      const measures = section?.measures ?? 0
      const start = section?.start ?? INF

      if (measures > 0 && measures !== INF && bar >= start) {
        this.#bars.innerHTML = `${bar - start + 1}/${measures}`
        this.#progress.value = bar - start + 1
        this.#progress.max = measures
      } else {
        this.#bars = measures
        this.#progress.value = 0
        this.#progress.max = measures
      }
    }
  }

  get #container() {
    return this.shadowRoot.querySelector('div.container')
  }

  get #title() {
    return this.shadowRoot.querySelector('input[data-ref="title"]')
  }

  get #save() {
    return this.shadowRoot.querySelector('button[data-ref="save"]')
  }

  get #section() {
    return this.shadowRoot.querySelector('div[data-ref="name"]')
  }

  get #bars() {
    return this.shadowRoot.querySelector('div[data-ref="bars"]')
  }

  set #bars(v) {
    if (v === INF) {
      this.#bars.innerHTML = '<span class="infinity">∞</span>'
    } else if (v > 0) {
      this.#bars.innerHTML = `${v}`
    } else {
      this.#bars.innerHTML = ''
    }
  }

  get #progress() {
    const slot = this.shadowRoot.querySelector('slot[name="progress"]')
    const assigned = slot.assignedElements()

    return assigned[0] ?? this.shadowRoot.querySelector('progress')
  }

  get #text() {
    return this.shadowRoot.querySelector('div.text')
  }

  #handlers = {
    title: {
      keypress: (e) => {
        if (e.key === 'Enter') {
          this.#title.blur()
          this.dispatchEvent(new CustomEvent('save', { detail: {} }))
        }
      },

      input: (_) => {
        this.dispatchEvent(new CustomEvent('change', { detail: { title: this.title } }))
      },
    },

    save: {
      click: (_) => {
        this.dispatchEvent(new CustomEvent('save', { detail: {} }))
      },
    },
  }
}

function transmogrify(track) {
  return [...generators.transmogrify(track)].map((v) => {
    return {
      ID: v.ID,
      role: v.role,
      name: v.name,
      measures: v.measures,
      colour: v.colour,
      start: v.start,
    }
  })
}

customElements.define('yam-info', Info)
