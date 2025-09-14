import { INF } from '../constants.js'

export class Section extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #section = {}

  #handlers = {
    role: {
      change: (e) => {
        const shadow = this.shadowRoot
        const measures = shadow.querySelector('#measures')

        if (e.target.value === 'anacrusis') {
          measures.readOnly = false
          measures.placeholder = '1'

          measures.setAttribute('min', 1)
          measures.setAttribute('max', 1)
          measures.reportValidity()
        } else {
          measures.readOnly = (this.#section?.subsections?.length ?? 0) > 0
          measures.setAttribute('min', 1)
          measures.removeAttribute('max')
          measures.reportValidity()
        }
      },
    },
  }

  constructor() {
    super()

    const template = document.getElementById('template-section')
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
    this.classList.add('component-section')

    const shadow = this.shadowRoot
    const role = shadow.querySelector('#role')

    role.addEventListener('input', this.#handlers.role.change)
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
    measures.placeholder = role.value === 'anacrusis' ? 1 : '∞'

    if (role.value === 'anacrusis') {
      measures.setAttribute('min', 1)
      measures.setAttribute('max', 1)
      measures.readOnly = false
    } else {
      measures.setAttribute('min', 1)
      measures.removeAttribute('max')
      measures.readOnly = (v.subsections?.length ?? 0) > 0
    }

    this.#section = v
  }

  get name() {
    const shadow = this.shadowRoot
    const name = shadow.querySelector('#name')

    return name.value.trim()
  }

  get role() {
    const shadow = this.shadowRoot
    const role = shadow.querySelector('#role')

    return role.value.trim()
  }

  get measures() {
    const shadow = this.shadowRoot
    const measures = shadow.querySelector('#measures')

    if (measures.value === '') {
      return INF
    } else {
      const N = Number.parseInt(measures.value)

      if (Number.isNaN(N)) {
        return undefined
      } else {
        return N
      }
    }
  }
}

customElements.define('yam-section', Section)
