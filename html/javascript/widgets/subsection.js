import { EVENTS } from '../constants.js'

export class Subsection extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  // ... fields
  #fields = {}

  // ... state
  #subsection = {}

  // ... handlers
  #handlers = {
    measures: {
      change: () => {
        this.dispatchEvent(new CustomEvent(EVENTS.SECTION_MEASURES_CHANGE, { bubbles: true, composed: true, detail: {} }))
      },
    },
  }

  constructor() {
    super()

    const template = document.getElementById('template-subsection')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/widgets.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)

    this.#fields = {}

    if (Object.values(this.#fields).some((e) => e == null)) {
      throw new Error('missing fields')
    }
  }

  connectedCallback() {
    this.classList.add('component-subsection')

    this.#measures.addEventListener('input', this.#handlers.measures.change)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set subsection(subsection) {
    // ... stash state
    this.#subsection = subsection

    // ... initialise fields
    this.#timeSignature = {
      timeSignature: subsection?.timeSignature ?? '',
      defaults: subsection?.defaults ?? {},
    }

    this.#tempo = {
      tempo: subsection?.tempo ?? {},
      timeSignature: subsection?.timeSignature ?? '',
      defaults: subsection?.defaults ?? {},
    }

    this.#measures = subsection?.measures ?? ''
    this.#measures.placeholder = '∞'
  }

  set track(object) {
    this.#tempo.then((v) => (v.track = object))
  }

  set defaults(object) {
    const timeSignature = object?.timeSignature
    const pulse = object?.pulse
    const BPM = object?.BPM

    if (timeSignature != null && timeSignature !== '') {
      this.#timeSignature.then((v) => {
        v.defaults = {
          timeSignature: timeSignature,
        }
      })
    }

    if (pulse != null && pulse !== '') {
      this.#tempo.then((v) => {
        v.defaults = {
          pulse: pulse,
        }
      })
    }

    if (BPM != null && BPM >= 40 && BPM <= 200) {
      this.#tempo.then((v) => {
        v.defaults = {
          BPM: BPM,
        }
      })
    }
  }

  get measures() {
    const measures = parseInt(`${this.#measures?.value}`)

    if (!Number.isNaN(measures) && measures >= 0) {
      return measures
    }

    return null
  }

  set measures(v) {
    if (v === '') {
      this.#measures.value = ''
      return
    }

    const measures = Number.parseInt(`${v}`)
    if (!Number.isNaN(measures) && measures >= 0) {
      this.#measures.value = `${measures}`
    }
  }

  get timeSignature() {
    const e = this.shadowRoot?.querySelector('yam-section-time-signature')

    return e?.timeSignature ?? this.#subsection.timeSignature
  }

  get tempo() {
    const e = this.shadowRoot?.querySelector('yam-section-mm')

    return e?.tempo ?? this.#subsection.tempo
  }

  get #timeSignature() {
    return (async () => {
      await customElements.whenDefined('yam-section-time-signature')

      return this.shadowRoot?.querySelector('yam-section-time-signature')
    })()
  }

  set #timeSignature({ timeSignature, defaults }) {
    void (async () => {
      await customElements.whenDefined('yam-section-time-signature')
      const e = this.shadowRoot?.querySelector('yam-section-time-signature')
      if (e) {
        e.timeSignature = {
          timeSignature: timeSignature,
          defaults: defaults,
        }
      }
    })()
  }

  get #tempo() {
    return (async () => {
      await customElements.whenDefined('yam-section-mm')

      return this.shadowRoot?.querySelector('yam-section-mm')
    })()
  }

  set #tempo({ tempo, timeSignature, defaults }) {
    void (async () => {
      await customElements.whenDefined('yam-section-mm')
      const e = this.shadowRoot?.querySelector('yam-section-mm')
      if (e) {
        e.tempo = {
          pulse: tempo.pulse,
          BPM: tempo.BPM,
          defaults: defaults,
        }

        e.timeSignature = timeSignature
      }
    })()
  }

  get #measures() {
    if (this.#fields.measures == null) {
      this.#fields.measures = this.shadowRoot?.querySelector('#measures')
    }

    return this.#fields.measures
  }

  set #measures(bars) {
    if (this.#fields.measures == null) {
      this.#fields.measures = this.shadowRoot?.querySelector('#measures')
    }

    this.#fields.measures.value = bars
  }
}

customElements.define('yam-subsection', Subsection)
