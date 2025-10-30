import { COLOURS, INF } from '../constants.js'
import * as datastore from '../datastore/datastore.js'

export class Info extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #track = null

  #cache = {
    section: -1,
    bar: -1,
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

  constructor() {
    super()

    const template = document.querySelector('#template-info')
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
    this.classList.add('component-info')

    this.#title.addEventListener('keypress', this.#handlers.title.keypress)
    this.#title.addEventListener('input', this.#handlers.title.input)
    this.#save.addEventListener('click', this.#handlers.save.click)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set track(v) {
    const track = datastore.tracks.get(v)

    this.#track = track
    this.#cache.section = -1
    this.#cache.bar = -1

    // ... set title
    this.title = track?.title ?? ''

    // ... set detail
    const sections = track?.sections ?? []

    if (sections.length > 0) {
      const section = sections[0]

      this.#container.classList.add('details')
      this.#text.classList.remove('playing')
      this.#section.innerHTML = section?.name ?? ''
      this.#bars = {
        playing: false,
      }

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

  redraw({ playing, stopped, bar }) {
    const track = this.#track
    const sections = track?.sections ?? []

    const section = () => {
      if (sections.length > 0 && bar > 0) {
        return sections.findLast((v) => v.start <= bar)
      } else if (sections.length > 0) {
        return sections[0]
      } else {
        return null
      }
    }

    this.#redraw(bar, playing, stopped, section())
  }

  #redraw(bar, playing, stopped, section) {
    if (section?.ID !== this.#cache.section) {
      this.#cache.section = section?.ID

      const name = section?.name ?? ''
      const colour = section?.colour ?? '#00000000'
      const text = COLOURS.get(section?.colour ?? '') ?? '#222222'

      // NB set the colour before setting the progress bar value/max
      if (!playing) {
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

    if (!playing && stopped) {
      this.#cache.bar = null

      this.#bars = {
        playing: playing,
        section: null,
        bar: null,
      }

      this.#progress.value = 0
      this.#progress.max = this.#track?.bars ?? 0
    } else if (playing && !stopped && bar != this.#cache.bar) {
      this.#cache.bar = bar

      this.#bars = {
        playing: playing,
        section: section,
        bar: bar,
      }

      const measures = section?.measures ?? 0
      const start = section?.start ?? INF

      if (measures > 0 && measures !== INF && bar >= start) {
        this.#progress.value = bar - start + 1
        this.#progress.max = measures
      } else {
        this.#progress.value = 0
        this.#progress.max = measures
      }
    }
  }

  get #container() {
    return this.shadowRoot.querySelector('div.info')
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

  set #bars({ playing, section, bar }) {
    const bars = this.#track?.bars ?? 0
    const countIn = this.#track?.countIn ?? 0
    const pickup = this.#track?.pickup ?? 0

    const measures = section?.measures ?? 0
    const start = section?.start ?? INF

    switch (true) {
      case !playing && bars === INF:
        if (countIn > 0 && pickup > 0) {
          this.#bars.innerHTML = `${countIn}+${pickup} +<span class="infinity">&infin;</span>`
        } else if (countIn > 0) {
          this.#bars.innerHTML = `${countIn} +<span class="infinity">&infin;</span>`
        } else if (pickup > 0) {
          this.#bars.innerHTML = `${pickup} +<span class="infinity">&infin;</span>`
        } else {
          this.#bars.innerHTML = '<span class="infinity">&infin;</span>'
        }
        break

      case !playing && bars <= 0:
        this.#bars.innerHTML = ''
        break

      case !playing:
        if (countIn > 0 && pickup > 0) {
          this.#bars.innerHTML = `${countIn}+${pickup}+${bars - countIn - pickup}`
        } else if (countIn > 0) {
          this.#bars.innerHTML = `${countIn}+${bars - countIn - pickup}`
        } else if (pickup > 0) {
          this.#bars.innerHTML = `${pickup}+${bars - countIn - pickup}`
        } else {
          this.#bars.innerHTML = `${bars - countIn - pickup}`
        }
        break

      case playing && measures === INF:
        this.#bars.innerHTML = '<span class="infinity">&infin;</span>'
        break

      case playing && measures > 0 && bar != null && bar >= start:
        this.#bars.innerHTML = `${bar - start + 1}/${measures}`
        break

      case playing && measures > 0:
        this.#bars.innerHTML = `${measures}`
        break

      default:
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
}

customElements.define('yam-info', Info)
