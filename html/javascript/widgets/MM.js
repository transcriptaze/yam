import { parseTimeSignature, parsePulse } from '../util.js'

// prettier-ignore
const PULSES = new Map([
  ['eighth',         './images/MM/eighth-equals.svg'         ],
  ['eighth-doublet', './images/MM/eighth-doublet-equals.svg' ],
  ['quarter',        './images/MM/quarter-equals.svg'        ],
  ['dotted-quarter', './images/MM/dotted-quarter-equals.svg' ],
  ['half',           './images/MM/half-equals.svg'           ],
  ['dotted-half',    './images/MM/dotted-half-equals.svg'    ],
])

const NONE = './images/MM/pulse/none.svg'

export class MM extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'locked']
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
          this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: { pulse: pulse } }))
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
          this.#BPM = bpm
          this.dispatchEvent(new CustomEvent('change', { bubbles: true, composed: true, detail: { BPM: bpm } }))
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

    overlay: {
      click: () => {
        const container = this.shadowRoot.querySelector('div.MM')

        if (container.classList.contains('locked')) {
          container.classList.add('tapped')
        }
      },
    },

    lock: {
      animated: () => {
        const container = this.shadowRoot.querySelector('div.MM')

        container.classList.remove('tapped')
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
    const button = shadow.querySelector('[popovertarget]')
    const overlay = shadow.querySelector('div.overlay')
    const lock = shadow.querySelector('#lock')

    list.addEventListener('click', this.#handlers.list.click)
    input.addEventListener('keypress', this.#handlers.input.keypress)
    input.addEventListener('input', this.#handlers.input.change)

    overlay.addEventListener('click', this.#handlers.overlay.click)
    lock.addEventListener('animationend', this.#handlers.lock.animated)

    // FireFox doesn't support CSS anchor positioning
    if (!CSS.supports('top: anchor(bottom)')) {
      button.addEventListener('click', this.#handlers.button.click)
    }
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(name, from, to) {
    if (name === 'disabled') {
      this.#disabled = to != null ? true : false
    }

    if (name === 'locked') {
      this.#locked = to != null ? true : false
    }
  }

  set disabled(v) {
    if (v === true) {
      this.setAttribute('disabled', '')
    } else {
      this.removeAttribute('disabled')
    }
  }

  set locked(v) {
    if (v === true) {
      this.setAttribute('locked', '')
    } else {
      this.removeAttribute('locked')
    }
  }

  get pulse() {
    return this.#pulse
  }

  set pulse(v) {
    const shadow = this.shadowRoot
    const img = shadow.querySelector('#pulse')

    if (v == null || v === '') {
      this.#pulse = 'quarter'
    } else {
      this.#pulse = parsePulse(v)
    }

    if (PULSES.has(this.#pulse)) {
      img.src = PULSES.get(this.#pulse)
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

  set tempo({ pulse, BPM }) {
    this.pulse = pulse
    this.BPM = BPM

    this.#redraw()
  }

  redraw(BPM, pulse, { playing, stopped }) {
    if (((playing || stopped) && BPM !== this.#BPM) || pulse !== this.#pulse) {
      this.#BPM = BPM
      this.#pulse = pulse

      this.#redraw()
    }
  }

  get #disabled() {
    return this.getAttribute('disabled') != null
  }

  set #disabled(v) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.MM')
    const button = shadow.querySelector('button')
    const input = shadow.querySelector('input')

    if (v === true) {
      button.disabled = true
      input.disabled = true
      container.classList.add('disabled')
    } else {
      button.disabled = this.#locked
      input.disabled = this.#locked
      container.classList.remove('disabled')
    }
  }

  get #locked() {
    return this.getAttribute('locked') != null
  }

  set #locked(v) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.MM')
    const input = shadow.querySelector('input')
    const button = shadow.querySelector('button')

    if (v === true) {
      button.disabled = true
      input.disabled = true
      container.classList.add('locked')
    } else {
      button.disabled = this.#disabled
      input.disabled = this.#locked
      container.classList.remove('locked')
    }
  }

  #redraw() {
    const shadow = this.shadowRoot
    const pulse = shadow.querySelector('#pulse')
    const BPM = shadow.querySelector('input')

    if (PULSES.has(this.#pulse)) {
      pulse.src = PULSES.get(this.#pulse)
    } else {
      pulse.src = PULSES.get(`quarter`)
    }

    BPM.value = `${this.#BPM}`
  }
}

customElements.define('yam-mm', MM)
