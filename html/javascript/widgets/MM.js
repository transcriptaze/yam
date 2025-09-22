import { parseTimeSignature, parsePulse } from '../util.js'

const PULSES = new Map([
  ['eighth', './images/MM/eighth-equals.svg'],
  ['eighth-doublet', './images/MM/eighth-doublet-equals.svg'],
  ['quarter', './images/MM/quarter-equals.svg'],
  ['dotted-quarter', './images/MM/dotted-quarter-equals.svg'],
  ['half', './images/MM/half-equals.svg'],
  ['dotted-half', './images/MM/dotted-half-equals.svg'],
])

export class MM extends HTMLElement {
  static get observedAttributes() {
    return ['disabled']
  }

  #BPM = 120
  #pulse = 'quarter'

  #handlers = {
    list: {
      click: (e) => {
        const pulse = e.target.dataset.pulse ?? e.target.parentElement?.dataset.pulse

        if (pulse != null) {
          const shadow = this.shadowRoot
          const popover = shadow.querySelector('[popover]')

          popover.hidePopover()

          this.dispatchEvent(
            new CustomEvent('change', {
              bubbles: true,
              composed: true,
              detail: {
                pulse: pulse,
              },
            }),
          )
        }
      },
    },

    input: {
      keypress: (e) => {
        const shadow = this.shadowRoot
        const input = shadow.querySelector('input')

        if (e.key === 'Enter') {
          input.blur()
        } else if (!/[0-9]/.test(e.key)) {
          e.preventDefault()
        }
      },

      change: (_) => {
        const shadow = this.shadowRoot
        const input = shadow.querySelector('input')
        const bpm = parseInt(`${input.value}`, 10)

        if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
          this.dispatchEvent(
            new CustomEvent('change', {
              bubbles: true,
              composed: true,
              detail: {
                BPM: bpm,
              },
            }),
          )
        }
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-mm')
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
    this.classList.add('component-mm')

    const shadow = this.shadowRoot
    const list = shadow.querySelector('div.content')
    const input = shadow.querySelector('input')

    list.addEventListener('click', this.#handlers.list.click)
    input.addEventListener('keypress', this.#handlers.input.keypress)
    input.addEventListener('input', this.#handlers.input.change)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, from, to) {
    if (name === 'disabled') {
      this.disabled = to != null ? true : false
    }
  }

  get BPM() {
    return this.#BPM
  }

  set BPM(v) {
    const shadow = this.shadowRoot
    const input = shadow.querySelector('input')
    const bpm = parseInt(`${v}`, 10)

    if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
      this.#BPM = bpm
      input.value = `${bpm}`
    }
  }

  get pulse() {
    return this.#pulse
  }

  set pulse(v) {
    const shadow = this.shadowRoot
    const img = shadow.querySelector('#pulse')
    const pulse = parsePulse(v)

    if (pulse != null) {
      this.#pulse = pulse
      if (PULSES.has(`${pulse}`)) {
        img.src = PULSES.get(`${pulse}`)
      }
    }
  }

  set timeSignature(v) {
    const { divisions } = parseTimeSignature(v)

    if (divisions === 8) {
      this.setAttribute('figura', 'eighth')
    } else {
      this.setAttribute('figura', '')
    }
  }

  set MM({ pulse, BPM }) {
    if (pulse == null || pulse === '' || BPM == null || Number.isNaN(BPM) || BPM === '') {
      this.#pulse = ''
      this.#BPM = ''
    } else {
      this.#pulse = pulse
      this.#BPM = BPM
    }

    this.#redraw()
  }

  set disabled(v) {
    const shadow = this.shadowRoot
    const button = shadow.querySelector('button')
    const input = shadow.querySelector('input')

    button.disabled = v === true
    input.disabled = v === true
  }

  redraw(BPM, pulse, { playing, stopped }) {
    if (((playing || stopped) && BPM !== this.#BPM) || pulse !== this.#pulse) {
      this.#BPM = BPM
      this.#pulse = pulse

      this.#redraw()
    }
  }

  #redraw() {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.MM')
    const pulse = shadow.querySelector('#pulse')
    const BPM = shadow.querySelector('input')

    if (`${this.#pulse}` === '' || `${this.#BPM}` === '') {
      div.classList.add('none')
    } else {
      div.classList.remove('none')
    }

    if (PULSES.has(`${this.#pulse}`)) {
      pulse.src = PULSES.get(`${pulse}`)
    } else {
      pulse.src = PULSES.get(`quarter`)
    }

    BPM.value = `${this.#BPM}`
  }
}

customElements.define('yam-mm', MM)
