import { EVENTS, INF } from '../constants.js'

export class Section extends HTMLElement {
  static get observedAttributes() {
    return ['expanded']
  }

  // ... fields
  #cache = {}

  // ... state
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

    expand: {
      click: (e) => {
        e.preventDefault()

        const attr = this.getAttribute('expanded')
        if (attr == null) {
          this.setAttribute('expanded', '')
        } else {
          this.removeAttribute('expanded')
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

    this.#role.addEventListener('input', this.#handlers.role.change)
    this.#measures.addEventListener('invalid', this.#handlers.measures.invalid)
    this.#expand.addEventListener('click', this.#handlers.expand.click)
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
    this.#name.placeholder = section?.name?.generated ?? '-- section --'

    this.#role.value = section?.role?.track ?? ''
    this.#role.placeholder = section?.role?.generated ?? '-- role --'

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

    const subsections = section?.subsections ?? []

    for (const subsection of subsections) {
      const e = document.createElement('yam-subsection')

      e.subsection = subsection

      this.#subsections.appendChild(e)
    }
  }

  // // NTS: returns the defaults from the last subsection for the cascase update
  // set defaults(object) {
  //   const subsections = this.#subsections?.querySelectorAll('yam-subsection') ?? []
  //
  //   for (const subsection of subsections) {
  //     subsection.defaults = object
  //
  //     const { beats, divisions } = parseTimeSignature(`${subsection.timeSignature}`)
  //     const tempo = subsection.tempo
  //
  //     if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
  //       object.timeSignature = subsection.timeSignature
  //     }
  //
  //     if (tempo.pulse != null && tempo.pulse !== '') {
  //       object.pulse = tempo.pulse
  //     }
  //
  //     if (tempo.BPM != null && tempo.BPM >= 40 && tempo.BPM < 200) {
  //       object.BPM = tempo.BPM
  //     }
  //   }
  // }

  get name() {
    return this.#cache.name.value.trim()
  }

  get role() {
    return this.#cache.role.value.trim()
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

  get subsections() {
    return Array.from(this.#subsections?.querySelectorAll('yam-subsection') ?? [])
  }

  get #name() {
    if (this.#cache.name == null) {
      this.#cache.name = this.shadowRoot?.querySelector('#name')
    }

    return this.#cache.name
  }

  get #role() {
    if (this.#cache.role == null) {
      this.#cache.role = this.shadowRoot.querySelector('#role')
    }

    return this.#cache.role
  }

  get #measures() {
    if (this.#cache.measures == null) {
      this.#cache.measures = this.shadowRoot?.querySelector('#measures')
    }

    return this.#cache.measures
  }

  get #subsections() {
    if (this.#cache.subsections == null) {
      this.#cache.subsections = this.shadowRoot?.querySelector('div.subsections')
    }

    return this.#cache.subsections
  }

  get #expand() {
    if (this.#cache.expand == null) {
      this.#cache.expand = this.shadowRoot.querySelector('#arrow')
    }

    return this.#cache.expand
  }
}

customElements.define('yam-section', Section)
