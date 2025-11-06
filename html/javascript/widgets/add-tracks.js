export class AddTracks extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  // #tracks = new Map()

  constructor() {
    super()

    const template = document.querySelector('#template-add-tracks')
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
    this.classList.add('component-add-tracks')
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}
}

customElements.define('yam-add-tracks', AddTracks)
