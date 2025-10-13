export class Ding extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #handlers = {
    checkbox: {
      change: (e) => {
        console.log(e)
        // this.dispatchEvent(
        //   new CustomEvent('change', {
        //     bubbles: true,
        //     composed: true,
        //     detail: {
        //       loop: e.target.checked,
        //     },
        //   }),
        // )
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

  attributeChangedCallback(name, from, to) {
    if (name === 'disabled') {
      this.disabled = to != null ? true : false
    }
  }

  set enabled(v) {
    this.shadowRoot.querySelector('input').disabled = v !== true
  }

  get ding() {
    return this.shadowRoot.querySelector('input').checked
  }

  set ding(v) {
    this.shadowRoot.querySelector('input').checked = v === true
  }
}

customElements.define('yam-ding', Ding)
