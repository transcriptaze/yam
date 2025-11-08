import { EVENTS, INF } from '../constants.js'

export class Section extends HTMLElement {
  static get observedAttributes() {
    return ['expanded']
  }

  // ... fields
  #fields = {}

  // ... state
  #section = {}

  // ... handlers
  #handlers = {
    name: {
      change: () => {
        this.dispatchEvent(new CustomEvent(EVENTS.SECTION_CHANGED, { bubbles: true, composed: true, detail: {} }))
      },
    },

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

        this.dispatchEvent(new CustomEvent(EVENTS.SECTION_CHANGED, { bubbles: true, composed: true, detail: {} }))
      },
    },

    measures: {
      invalid: (e) => {
        e.preventDefault()
      },

      change: () => {
        const subsections = this.subsections ?? []

        for (const subsection of subsections) {
          subsection.measures = this.#measures.value
          break
        }

        this.dispatchEvent(new CustomEvent(EVENTS.SECTION_CHANGED, { bubbles: true, composed: true, detail: {} }))
      },

      changed: () => {
        const subsections = this.subsections
        const bars = subsections.reduce((bars, ss) => (Number.isNaN(ss.measures) || ss.measures == null ? INF : bars + ss.measures), 0)

        this.#measures.value = Number.isFinite(bars) ? bars : ''
      },
    },

    expand: {
      click: (e) => {
        e.preventDefault()

        if (this.#expanded) {
          this.removeAttribute('expanded')
        } else {
          this.setAttribute('expanded', '')
        }

        this.dispatchEvent(new CustomEvent(EVENTS.SECTION_EXPAND, { bubbles: true, composed: true, detail: {} }))
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

    this.#name.addEventListener('input', this.#handlers.name.change)
    this.#role.addEventListener('input', this.#handlers.role.change)
    this.#measures.addEventListener('invalid', this.#handlers.measures.invalid)
    this.#measures.addEventListener('input', this.#handlers.measures.change)
    this.#expand.addEventListener('click', this.#handlers.expand.click)

    this.#subsections.addEventListener(EVENTS.SECTION_MEASURES_CHANGE, this.#handlers.measures.changed)
  }

  disconnectedCallback() {
    this.#fields = {}
  }

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

      this.#measures.readOnly = this.#expanded || (this.#section?.subsections?.length ?? 0) > 1
    }
  }

  set section(section) {
    // ... stash state
    this.#section = section

    // ... initialise fields
    this.#name.value = section?.name?.track ?? ''
    this.#name.placeholder = section?.name?.generated ?? '-- section --'

    this.#role.value = section?.role?.track ?? ''
    this.#role.placeholder = section?.role?.generated ?? '-- role --'

    if (this.#role.value === 'anacrusis') {
      this.#measures.setAttribute('min', 1)
      this.#measures.setAttribute('max', 1)
    } else {
      this.#measures.setAttribute('min', 1)
      this.#measures.removeAttribute('max')
    }

    this.#measures.readOnly = this.#expanded || (section?.subsections?.length ?? 0) > 1
    this.#measures.value = section?.measures ?? 0
    this.#measures.placeholder = this.#role.value === 'anacrusis' ? 1 : '∞'

    const subsections = section?.subsections ?? []

    for (const subsection of subsections) {
      const e = document.createElement('yam-subsection')

      e.subsection = subsection

      this.#subsections.appendChild(e)
    }
  }

  get name() {
    return this.#fields.name.value.trim()
  }

  get role() {
    return this.#fields.role.value.trim()
  }

  get measures() {
    const measures = this.#measures?.value ?? ''

    if (measures === '') {
      return INF
    }

    const N = Number.parseInt(measures)
    if (Number.isNaN(N)) {
      return undefined
    } else {
      return N
    }
  }

  get timeSignature() {
    const e = this.shadowRoot?.querySelector('yam-subsection')

    return e?.timeSignature ?? this.#section.timeSignature
  }

  get tempo() {
    const e = this.shadowRoot?.querySelector('yam-subsection')

    return e?.tempo ?? this.#section.tempo
  }

  // FIXME should map subsections to list of { timeSignature, pulse, tempo }
  //       editor::set-defaults needs rethinking though
  get subsections() {
    const subsections = this.#subsections?.querySelectorAll('yam-subsection')

    return Array.from(subsections ?? [])
  }

  get #name() {
    if (this.#fields.name == null) {
      this.#fields.name = this.shadowRoot?.querySelector('#name')
    }

    return this.#fields.name
  }

  get #role() {
    if (this.#fields.role == null) {
      this.#fields.role = this.shadowRoot.querySelector('#role')
    }

    return this.#fields.role
  }

  get #measures() {
    if (this.#fields.measures == null) {
      this.#fields.measures = this.shadowRoot?.querySelector('#measures')
    }

    return this.#fields.measures
  }

  get #subsections() {
    if (this.#fields.subsections == null) {
      this.#fields.subsections = this.shadowRoot?.querySelector('div.subsections')
    }

    return this.#fields.subsections
  }

  get #expand() {
    if (this.#fields.expand == null) {
      this.#fields.expand = this.shadowRoot.querySelector('#arrow')
    }

    return this.#fields.expand
  }

  get #expanded() {
    return this.getAttribute('expanded') == null ? false : true
  }
}

customElements.define('yam-section', Section)
