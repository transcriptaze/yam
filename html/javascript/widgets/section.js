import { INF } from '../constants.js'

export class Section extends HTMLElement {
  static get observedAttributes() {
    return ['expanded']
  }

  // ... fields
  #fields = {}

  // ... state
  // #track = {}
  #section = {}

  // ... handlers
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

    measures: {
      invalid: (e) => {
        e.preventDefault()
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

    this.#fields = {
      name: shadow.querySelector('#name'),
      role: shadow.querySelector('#role'),
      measures: shadow.querySelector('#measures'),
    }

    if (Object.values(this.#fields).some((e) => e == null)) {
      throw new Error('missing fields')
    }
  }

  connectedCallback() {
    this.classList.add('component-section')

    this.#fields.role.addEventListener('input', this.#handlers.role.change)
    this.#fields.measures.addEventListener('invalid', this.#handlers.measures.invalid)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, from, to) {
    if (name === 'expanded') {
      const shadow = this.shadowRoot
      const div = shadow.querySelector('div.section')

      if (to != null) {
        div.classList.remove('collapsed')
      } else {
        div.classList.add('collapsed')
      }
    }
  }

  set section(section) {
    // ... stash state
    this.#section = section

    // ... initialise fields
    this.#name.value = section?.name?.track ?? ''
    this.#name.placeholder = section?.name?.generated ?? ''

    this.#role.value = section?.role?.track ?? ''
    this.#role.placeholder = section?.role?.generated ?? ''

    if (this.#role.value === 'anacrusis') {
      this.#measures.setAttribute('min', 1)
      this.#measures.setAttribute('max', 1)
      this.#measures.readOnly = false
    } else {
      this.#measures.setAttribute('min', 1)
      this.#measures.removeAttribute('max')
      this.#measures.readOnly = (section?.subsections?.length ?? 0) > 0
    }

    this.#measures.value = section?.measures ?? 0
    this.#measures.placeholder = this.#role.value === 'anacrusis' ? 1 : '∞'

    this.#timeSignature = section?.timeSignature ?? ''

    this.#tempo = {
      tempo: section?.tempo ?? {},
      timeSignature: section?.timeSignature ?? '',
    }
  }

  get name() {
    return this.#fields.name.value.trim()
  }

  get role() {
    return this.#fields.role.value.trim()
  }

  get measures() {
    if (this.#fields.measures.value === '') {
      return INF
    } else {
      const N = Number.parseInt(this.#fields.measures.value)

      if (Number.isNaN(N)) {
        return undefined
      } else {
        return N
      }
    }
  }

  get #name() {
    return this.#fields.name
  }

  get #role() {
    return this.#fields.role
  }

  get #measures() {
    return this.#fields.measures
  }

  get timeSignature() {
    const e = this.shadowRoot?.querySelector('yam-time-signature')

    return e?.timeSignature ?? this.#section.timeSignature
  }

  set #timeSignature(v) {
    void (async () => {
      await customElements.whenDefined('yam-time-signature')
      const e = this.shadowRoot?.querySelector('yam-time-signature')
      if (e) {
        e.timeSignature = v
      }
    })()
  }

  get tempo() {
    const e = this.shadowRoot?.querySelector('yam-mm')

    return e?.tempo ?? this.#section.tempo
  }

  get #tempo() {
    return (async () => {
      await customElements.whenDefined('yam-mm')

      return this.shadowRoot?.querySelector('yam-mm')
    })()
  }

  set #tempo({ tempo, timeSignature }) {
    void (async () => {
      await customElements.whenDefined('yam-mm')
      const e = this.shadowRoot?.querySelector('yam-mm')
      if (e) {
        e.tempo = tempo
        e.timeSignature = timeSignature
      }
    })()
  }
}

customElements.define('yam-section', Section)
