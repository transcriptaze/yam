import { parseTimeSignature, parsePulse } from '../util.js'

// prettier-ignore
const PULSES = new Map([
  ['eighth',         { img: './images/MM/eighth-equals.svg',         imx: './images/MM/eighth-no-equals.svg',         li: './images/MM/popover/eighth.svg'         }],
  ['eighth-doublet', { img: './images/MM/eighth-doublet-equals.svg', imx: './images/MM/eighth-doublet-no-equals.svg', li: './images/MM/popover/eighth-doublet.svg' }],
  ['quarter',        { img: './images/MM/quarter-equals.svg',        imx: './images/MM/quarter-no-equals.svg',        li: './images/MM/popover/quarter.svg'        }],
  ['dotted-quarter', { img: './images/MM/dotted-quarter-equals.svg', imx: './images/MM/dotted-quarter-no-equals.svg', li: './images/MM/popover/dotted-quarter.svg' }],
  ['half',           { img: './images/MM/half-equals.svg',           imx: './images/MM/half-no-equals.svg',           li: './images/MM/popover/half.svg'           }],
  ['dotted-half',    { img: './images/MM/dotted-half-equals.svg',    imx: './images/MM/dotted-half-no-equals.svg',    li: './images/MM/popover/dotted-half.svg'    }],
])

const NONE = './images/MM/pulse/none.svg'

export class SectionMM extends HTMLElement {
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
          this.shadowRoot.querySelector('[popover]')?.hidePopover()

          this.pulse = pulse

          if (pulse !== '') {
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

        if (input.value === '') {
          this.#BPM = ''
        } else if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
          this.#BPM = bpm

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

    const template = document.querySelector('#template-section-mm')
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
    this.classList.add('component-section-mm')

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

  get pulse() {
    return this.#pulse
  }

  set pulse(v) {
    const shadow = this.shadowRoot
    const img = shadow.querySelector('#pulse')

    if (v == null || v === '') {
      this.#pulse = ''
    } else {
      this.#pulse = parsePulse(v)
    }

    if (PULSES.has(this.#pulse)) {
      img.src = PULSES.get(this.#pulse).img
    } else if (PULSES.has(img.dataset.defval)) {
      img.src = PULSES.get(img.dataset.defval).img
    } else {
      img.src = NONE
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

  set timeSignature(v) {
    const { divisions } = parseTimeSignature(v)

    if (divisions === 8) {
      this.setAttribute('figura', 'eighth')
    } else {
      this.setAttribute('figura', '')
    }
  }

  get tempo() {
    return {
      pulse: this.pulse,
      BPM: this.BPM,
    }
  }

  set tempo({ pulse, BPM, defaults }) {
    const shadow = this.shadowRoot
    const p = shadow.querySelector('#pulse')
    const bpm = shadow.querySelector('input')
    const none = shadow.querySelector('#list div.li[data-pulse=""] img')

    if (defaults != null && defaults.pulse != null) {
      p.dataset.defval = defaults.pulse
    } else {
      p.dataset.defval = 'quarter'
    }

    if (defaults != null && defaults.pulse != null) {
      none.src = PULSES.has(defaults.pulse) ? PULSES.get(defaults.pulse).li : NONE
    } else {
      none.src = NONE
    }

    if (defaults != null && defaults.BPM != null && !Number.isNaN(defaults.BPM) && defaults.BPM >= 40 && defaults.BPM <= 200) {
      bpm.dataset.defval = `${defaults.BPM}`
    } else {
      bpm.dataset.defval = `---`
    }

    this.pulse = pulse

    if (BPM == null || Number.isNaN(BPM) || BPM === '') {
      this.#BPM = ''
    } else {
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
    const button = shadow.querySelector('div.MM button')
    const pulse = shadow.querySelector('#pulse')
    const BPM = shadow.querySelector('input')

    if (this.#pulse != null && this.#pulse !== '') {
      button.classList.remove('none')
    } else {
      button.classList.add('none')
    }

    const p = this.#pulse != null && this.#pulse !== '' ? `${this.#pulse}` : `${pulse.dataset.defval}`
    const k = PULSES.has(p) ? p : 'quarter'

    if (this.#BPM != null && this.#BPM !== '') {
      pulse.src = PULSES.get(k).img
    } else {
      pulse.src = PULSES.get(k).imx
    }

    BPM.value = `${this.#BPM}`
    BPM.placeholder = BPM.dataset.defval
  }
}

customElements.define('yam-section-mm', SectionMM)
