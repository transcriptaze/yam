import { EVENTS } from '../constants.js'
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

const NONE = './images/MM/none.svg'

export class SectionMM extends HTMLElement {
  static get observedAttributes() {
    return ['disabled']
  }

  #tempo = {
    BPM: 120,
    pulse: 'quarter',
  }

  #track = {
    tempo: 120,
    BPM: 120,
  }

  #defaults = {
    pulse: 'quarter',
    BPM: 120,
  }

  #fields = {}

  #handlers = {
    list: {
      click: (e) => {
        const pulse = e.target.dataset.pulse ?? e.target.parentElement?.dataset.pulse

        if (pulse != null) {
          this.shadowRoot.querySelector('[popover]')?.hidePopover()

          this.pulse = pulse

          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_PULSE_CHANGE, {
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

    BPM: {
      keypress: (e) => {
        if (e.key === 'Enter') {
          this.#BPM.blur()
        } else if (!/[0-9]/.test(e.key)) {
          e.preventDefault()
        }
      },

      change: (_) => {
        const bpm = parseInt(`${this.#BPM.value}`, 10)

        if (this.#BPM.value === '' || (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200)) {
          this.#tempo.BPM = Number.isNaN(bpm) ? '' : bpm

          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_BPM_CHANGE, {
              bubbles: true,
              composed: true,
              detail: {
                BPM: Number.isNaN(bpm) ? '' : bpm,
              },
            }),
          )
        }
      },
    },

    button: {
      click: () => {
        const button = this.shadowRoot.querySelector('[popovertarget]')
        const target = button.getAttribute('popovertarget')
        const popover = this.shadowRoot.getElementById(target)
        const rect = button.getBoundingClientRect()

        popover.style.position = 'fixed'
        popover.style.top = `${rect.bottom + 4}px`
        popover.style.left = `${rect.left + 12}px`
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
    const button = shadow.querySelector('[popovertarget]')

    list.addEventListener('click', this.#handlers.list.click)
    this.#BPM.addEventListener('keypress', this.#handlers.BPM.keypress)
    this.#BPM.addEventListener('input', this.#handlers.BPM.change)

    // FireFox doesn't support CSS anchor positioning
    if (!CSS.supports('top: anchor(bottom)')) {
      button.addEventListener('click', this.#handlers.button.click)
    }
  }

  disconnectedCallback() {
    this.#fields = {}
  }

  adoptedCallback() {}

  attributeChangedCallback(name, from, to) {
    if (name === 'disabled') {
      this.disabled = to != null ? true : false
    }
  }

  get pulse() {
    return this.#tempo.pulse
  }

  set pulse(v) {
    if (v == null || v === '') {
      this.#tempo.pulse = ''
    } else {
      this.#tempo.pulse = parsePulse(v)
    }

    this.#redraw()
  }

  set track(object) {
    const tempo = object?.tempo
    const BPM = object?.BPM

    if (!Number.isNaN(tempo) && tempo >= 40 && tempo <= 200) {
      if (!Number.isNaN(BPM) && BPM >= 40 && BPM <= 200) {
        this.#track.tempo = tempo
        this.#track.BPM = BPM
      }
    }
  }

  set defaults(object) {
    const none = this.shadowRoot.querySelector('#list div.li[data-pulse=""] img')
    const pulse = object?.pulse ?? ''
    const BPM = object?.BPM ?? ''

    if (pulse !== '') {
      this.#defaults.pulse = pulse
      none.src = PULSES.has(pulse) ? PULSES.get(pulse).li : NONE
    }

    if (BPM !== '' && BPM >= 40 && BPM <= 200) {
      this.#defaults.BPM = BPM
    }

    this.#redraw()
  }

  get BPM() {
    return this.#tempo.BPM
  }

  set BPM(v) {
    const bpm = parseInt(`${v}`, 10)

    if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
      this.#tempo.BPM = bpm
      this.#BPM.value = `${bpm}`
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
    const none = shadow.querySelector('#list div.li[data-pulse=""] img')

    this.#defaults.pulse = defaults?.pulse ?? 'quarter'

    if (defaults != null && defaults.pulse != null) {
      none.src = PULSES.has(defaults.pulse) ? PULSES.get(defaults.pulse).li : NONE
    } else {
      none.src = NONE
    }

    if (defaults != null && defaults.BPM != null && !Number.isNaN(defaults.BPM) && defaults.BPM >= 40 && defaults.BPM <= 200) {
      this.#defaults.BPM = `${defaults.BPM}`
    } else {
      this.#defaults.BPM = `---`
    }

    this.pulse = pulse

    if (BPM == null || Number.isNaN(BPM) || BPM === '') {
      this.#tempo.BPM = ''
    } else {
      this.#tempo.BPM = BPM
    }

    this.#redraw()
  }

  set disabled(v) {
    const shadow = this.shadowRoot
    const button = shadow.querySelector('button')

    button.disabled = v === true
    this.#BPM.disabled = v === true
    this.#bpm.disabled = v === true
  }

  redraw(BPM, pulse, { playing, stopped }) {
    if (((playing || stopped) && BPM !== this.#tempo.BPM) || pulse !== this.#tempo.pulse) {
      this.#tempo.BPM = BPM
      this.#tempo.pulse = pulse

      this.#redraw()
    }
  }

  get #BPM() {
    if (this.#fields.BPM == null) {
      this.#fields.BPM = this.shadowRoot?.querySelector('#BPM')
    }

    return this.#fields.BPM
  }

  get #bpm() {
    if (this.#fields.bpm == null) {
      this.#fields.bpm = this.shadowRoot?.querySelector('#bpm')
    }

    return this.#fields.bpm
  }

  #redraw() {
    const shadow = this.shadowRoot
    const button = shadow.querySelector('div.MM button')
    const pulse = shadow.querySelector('#pulse')

    if (this.#tempo.pulse != null && this.#tempo.pulse !== '') {
      button.classList.remove('none')
    } else {
      button.classList.add('none')
    }

    const p = this.#tempo.pulse != null && this.#tempo.pulse !== '' ? `${this.#tempo.pulse}` : `${this.#defaults.pulse}`
    const k = PULSES.has(p) ? p : 'quarter'

    if (this.#tempo.BPM != null && this.#tempo.BPM !== '') {
      pulse.src = PULSES.get(k).img
    } else if ((this.#tempo.BPM == null || this.#tempo.BPM === '') && (this.#tempo.pulse == null || this.#tempo.pulse === '')) {
      pulse.src = PULSES.get(k).img
    } else {
      pulse.src = PULSES.get(k).imx
    }

    this.#BPM.value = `${this.#tempo.BPM}`
    this.#BPM.placeholder = this.#defaults.BPM

    // ... display metronome BPM (subsection tempo * track BPM / track tempo)
    const bpm = parseInt(`${this.#tempo.BPM}`)
    const defval = parseInt(`${this.#defaults.BPM}`)

    if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200) {
      this.#bpm.value = `(${Math.round((bpm * this.#track.BPM) / this.#track.tempo)})`
    } else if (!Number.isNaN(defval) && defval >= 40 && defval <= 200) {
      this.#bpm.value = `(${Math.round((defval * this.#track.BPM) / this.#track.tempo)})`
    } else {
      this.#bpm.value = ``
    }
  }
}

customElements.define('yam-section-mm', SectionMM)
