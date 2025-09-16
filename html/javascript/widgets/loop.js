import { INF } from '../constants.js'

export class Loop extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #loops = {
    loops: INF,
    count: 0,
  }

  #handlers = {
    checkbox: {
      change: (e) => {
        this.dispatchEvent(
          new CustomEvent('change', {
            bubbles: true,
            composed: true,
            detail: {
              loop: e.target.checked,
            },
          }),
        )
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-loop')
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
    this.classList.add('component-loop')

    const shadow = this.shadowRoot
    const loop = shadow.querySelector('input')

    loop.addEventListener('change', this.#handlers.checkbox.change)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, from, to) {
    if (name === 'disabled') {
      this.disabled = to != null ? true : false
    }
  }

  set enabled(v) {
    const shadow = this.shadowRoot
    const loop = shadow.querySelector('input')

    loop.disabled = v !== true
  }

  get loop() {
    const shadow = this.shadowRoot
    const loop = shadow.querySelector('input')

    return loop.checked
  }

  set loop(v) {
    const shadow = this.shadowRoot
    const loop = shadow.querySelector('input')

    loop.checked = v === true
  }

  set loops(v) {
    const shadow = this.shadowRoot
    const loop = shadow.querySelector('input')
    const N = parseInt(`${v}`)

    this.#loops.loops = !Number.isNaN(N) ? N : INF

    const remaining = this.#loops.loops - this.#loops.count

    if (remaining > 0 && remaining !== INF) {
      loop.dataset.loops = `${remaining}`
    } else {
      loop.dataset.loops = ''
    }
  }

  redraw({ loops }) {
    if (loops.loops !== this.#loops.loops || loops.count !== this.#loops.count) {
      this.#loops.loops = loops.loops
      this.#loops.count = loops.count

      const remaining = this.#loops.loops - this.#loops.count
      const shadow = this.shadowRoot
      const loop = shadow.querySelector('input')

      if (remaining > 0 && remaining !== INF) {
        loop.dataset.loops = `${remaining}`
      } else {
        loop.dataset.loops = ''
      }
    }
  }
}

customElements.define('yam-loop', Loop)
