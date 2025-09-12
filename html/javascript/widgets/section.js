export class Section extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  constructor() {
    super()

    const template = document.getElementById('template-section')
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
    this.classList.add('component-section')
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set section(v) {
    const shadow = this.shadowRoot
    const name = shadow.querySelector('#name')
    const role = shadow.querySelector('#role')
    const measures = shadow.querySelector('#measures')

    name.value = v?.name?.track ?? ''
    name.placeholder = v?.name?.generated ?? ''

    role.value = v?.role?.track ?? ''
    role.placeholder = v?.role?.generated ?? ''

    measures.value = v?.measures ?? 0
  }

  get name() {
    const shadow = this.shadowRoot
    const name = shadow.querySelector('#name')

    return name.value.trim()
  }
}

customElements.define('yam-section', Section)
