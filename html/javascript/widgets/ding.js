import * as datastore from '../datastore/datastore.js'

export class Ding extends HTMLElement {
  static get observedAttributes() {
    return ['hidden']
  }

  #handlers = {
    checkbox: {
      change: (e) => {
        this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: { ding: e.target.checked } }))
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-ding')
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
    this.classList.add('component-ding')

    const ding = this.shadowRoot.querySelector('input')

    ding.addEventListener('change', this.#handlers.checkbox.change)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  get ding() {
    return this.shadowRoot.querySelector('input').checked
  }

  set ding(v) {
    this.shadowRoot.querySelector('input').checked = v === true
  }

  set track(v) {
    const track = datastore.tracks.get(v)
    const dings = track?.dings ?? []

    if (dings.length > 0) {
      this.removeAttribute('hidden')
    } else {
      this.setAttribute('hidden', '')
    }

    this.ding = track?.ding ?? false
  }
}

customElements.define('yam-ding', Ding)
