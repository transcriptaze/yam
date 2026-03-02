import { EVENTS } from '../constants.js'

class FSM {
  #playing = false
  #stopped = true
  #dispatch = () => {}

  constructor(dispatch) {
    this.#dispatch = dispatch ?? (() => {})
  }

  toggle() {
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
        this.#FSM.toggle()
      },
    },

    stop: {
      click: (_) => {
        this.#FSM.toggle()
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
    this.classList.add('component-metronome')

    const play = this.shadowRoot.querySelector('div.metronome #play')
    const stop = this.shadowRoot.querySelector('div.metronome #stop')
    const back = this.shadowRoot.querySelector('div.metronome #back')
    const next = this.shadowRoot.querySelector('div.metronome #next')

    play.addEventListener('click', this.#handlers.play.click)
    stop.addEventListener('click', this.#handlers.stop.click)
    back.addEventListener('click', this.#handlers.back.click)
    next.addEventListener('click', this.#handlers.next.click)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set enabled(v) {
    this.#play.disabled = v !== true
    this.#stop.disabled = v !== true
  }

  set bof(v) {
    this.#back.disabled = v === true
  }

  set eof(v) {
    this.#next.disabled = v === true
  }

  onPlaying() {
    this.#container.classList.add('playing')
    this.#FSM.onPlaying()
  }

  onStopped() {
    this.#container.classList.remove('playing')
    this.#FSM.onStopped()
  }

  get #container() {
    return this.shadowRoot.querySelector('div.metronome')
  }

  get #play() {
    return this.shadowRoot.querySelector('div.metronome #play')
  }

  get #stop() {
    return this.shadowRoot.querySelector('div.metronome #stop')
  }

  get #back() {
    return this.shadowRoot.querySelector('div.metronome #back')
  }

  get #next() {
    return this.shadowRoot.querySelector('div.metronome #next')
  }
}

customElements.define('yam-metronome', Metronome)
