export class Beat extends HTMLElement {
  static get observedAttributes() {
    return ['beat']
  }

  #beat = -1
  #last = Math.NaN

  constructor() {
    super()

    const template = document.querySelector('#template-beat')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/web-components.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)
  }

  connectedCallback() {}

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, from, to) {
    if (name === 'beat') {
      const v = parseInt(`${to}`, 10)

      if (!Number.isNaN(v)) {
        this.beat = v
      }
    }
  }

  get beat() {
    return this.#beat
  }

  set beat(v) {
    const beat = parseFloat(`${v}`, 10)

    if (!Number.isNaN(beat)) {
      this.#beat = Math.round(2 * beat) / 2
      this.#last = Math.NaN
    }
  }

  redraw(beat) {
    const shadow = this.shadowRoot
    const block = shadow.querySelector('div.beat')
    const tick = parseFloat(`${beat}`, 10)

    if (!Number.isNaN(tick) && tick != this.#last) {
      if (Math.round(2 * tick) / 2 === this.beat) {
        block.classList.add('on')
      } else {
        block.classList.remove('on')
      }

      this.#last = tick
    }
  }
}

customElements.define('yam-beat', Beat)
