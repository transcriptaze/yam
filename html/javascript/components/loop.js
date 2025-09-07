export class Loop extends HTMLElement {
  static get observedAttributes() {
    return []
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
    stylesheet.setAttribute('href', '/css/web-components.css')

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

  set enabled(v) {
    const shadow = this.shadowRoot
    const loop = shadow.querySelector('input')

    loop.disabled = v !== true
  }
}

customElements.define('yam-loop', Loop)
