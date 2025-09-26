import { EVENTS } from '../constants.js'

class FSM {
  #playing = false
  #stopped = true
  #dispatch = () => {}

  constructor(dispatch) {
    this.#dispatch = dispatch
  }

  click() {
    if (!this.#playing && this.#stopped) {
      this.#dispatch(EVENTS.PLAY)
    }

    if (this.#playing && !this.#stopped) {
      this.#dispatch(EVENTS.STOP)
    }
  }

  onPlaying() {
    this.#playing = true
    this.#stopped = false
  }

  onStopped() {
    this.#playing = false
    this.#stopped = true
  }
}

export class Metronome extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #FSM = new FSM()

  #handlers = {
    play: {
      click: (_) => {
        this.#FSM.click()
      },
    },

    back: {
      click: (_) => {
        this.dispatchEvent(new CustomEvent(EVENTS.BACK))
      },
    },

    next: {
      click: (_) => {
        this.dispatchEvent(new CustomEvent(EVENTS.NEXT))
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-metronome')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/widgets.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)

    this.#FSM = new FSM((event) => {
      this.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true, detail: {} }))
    })
  }

  connectedCallback() {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.metronome')
    const play = div.querySelector('#play')
    const back = div.querySelector('#back')
    const next = div.querySelector('#next')

    play.addEventListener('click', this.#handlers.play.click)
    back.addEventListener('click', this.#handlers.back.click)
    next.addEventListener('click', this.#handlers.next.click)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set enabled(v) {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.metronome')
    const play = div.querySelector('#play')

    play.disabled = v !== true
  }

  set bof(v) {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.metronome')
    const back = div.querySelector('#back')

    back.disabled = v === true
  }

  set eof(v) {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.metronome')
    const next = div.querySelector('#next')

    next.disabled = v === true
  }

  onPlaying() {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.metronome')

    div.classList.add('playing')

    this.#FSM.onPlaying()
  }

  onStopped() {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.metronome')

    div.classList.remove('playing')

    this.#FSM.onStopped()
  }
}

customElements.define('yam-metronome', Metronome)
