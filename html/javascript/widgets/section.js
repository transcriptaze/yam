import { INF } from '../constants.js'

export class Section extends HTMLElement {
  static get observedAttributes() {
    return ['expanded']
  }

  #fields = {}

  // ... state
  #track = {}
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
      tempo: shadow.querySelector('#tempo'),
      BPM: shadow.querySelector('#BPM'),
    }

    if (Object.values(this.#fields).some((e) => e == null)) {
      throw new Error('Template is missing required element(s)')
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
        div.classList.add('collapsed')
      } else {
        div.classList.remove('collapsed')
      }
    }
  }

  set section({ track, section }) {
    // ... stash state
    this.#track = track
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

    this.#tempo.value = section?.tempo ?? ''
    this.#tempo.placeholder = '-'
    this.#BPM = section?.tempo
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

  get tempo() {
    if (this.#fields.tempo.value === '') {
      return ''
    } else {
      return Number.parseInt(this.#fields.tempo.value)
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

  get #tempo() {
    return this.#fields.tempo
  }

  get #BPM() {
    return this.#fields.BPM
  }

  set #BPM(v) {
    const TEMPO = this.#track?.tempo ?? null
    const BPM = this.#track?.BPM ?? null
    const tempo = Number.parseInt(this.#section?.tempo ?? '')

    if (Number.isNaN(tempo) || tempo < 40 || tempo > 200) {
      this.#fields.BPM.value = ''
    } else if (Number.isNaN(TEMPO) || TEMPO < 40 || TEMPO > 200) {
      this.#fields.BPM.value = ''
    } else if (Number.isNaN(BPM) || BPM < 40 || BPM > 200) {
      this.#fields.BPM.value = ''
    } else {
      this.#fields.BPM.value = `(${Math.round((tempo * BPM) / TEMPO)} BPM)`
    }
  }
}

customElements.define('yam-section', Section)
