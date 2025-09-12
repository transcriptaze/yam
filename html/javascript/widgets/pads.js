import { parseTimeSignature as parse } from '../util.js'

export class Pads extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #beats = 4
  #divisions = 4
  #pulse = 'quarter'
  #last = Math.NaN

  constructor() {
    super()

    const template = document.querySelector('#template-pads')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/web-components.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)
  }

  connectedCallback() {}

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set timeSignature(v) {
    const { beats, divisions } = parse(`${v}`)

    if (!Number.isNaN(beats) && !Number.isNaN(divisions) && (beats !== this.#beats || divisions !== this.#divisions)) {
      this.#beats = beats
      this.#divisions = divisions
      this.#layout()
    }
  }

  set pulse(v) {
    const pulse = `${v}`

    if (this.#pulse !== pulse) {
      this.#pulse = pulse
      this.#layout()
    }
  }

  redraw(beat, { playing, stopped, beats, divisions, pulse }) {
    const _beat = Number.parseFloat(beat, 10)

    if (playing || stopped) {
      const _beats = Number.parseInt(beats, 10)
      const _divisions = Number.parseInt(divisions, 10)
      let invalidate = false

      if (!Number.isNaN(_beats) && _beats !== this.#beats && _beats > 0 && _beats <= 32) {
        this.#beats = _beats
        invalidate = true
      }

      if (!Number.isNaN(_divisions) && _divisions !== this.#divisions && _divisions > 0 && _divisions <= 32) {
        this.#divisions = _divisions
        invalidate = true
      }

      if (pulse != null && pulse !== this.#pulse) {
        this.#pulse = pulse
        invalidate = true
      }

      if (invalidate) {
        this.#layout()
      }
    }

    if (!Number.isNaN(_beat) && _beat !== this.#last) {
      const shadow = this.shadowRoot
      const pads = shadow.querySelectorAll('.beat')

      pads.forEach((e) => e.redraw(_beat))

      this.#last = _beat
    }
  }

  #layout() {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.pads')
    const beats = this.#beats

    if (this.#divisions === 4 && this.#pulse === 'eighth-doublet') {
      const pads = []
      for (let i = 0; i < beats; i++) {
        const block = document.createElement('yam-beat')
        const diamond = document.createElement('yam-beat')

        block.classList.add('beat')
        block.classList.add('block')
        block.beat = `${i + 1}`

        diamond.classList.add('beat')
        diamond.classList.add('diamond')
        diamond.beat = `${i + 1}.5`

        pads.push(block)
        pads.push(diamond)
      }

      div.replaceChildren(...pads)
    } else if (this.#beats === 6 && this.#divisions === 8 && this.#pulse === 'dotted-quarter') {
      const pads = []
      for (let i = 0; i < beats; i++) {
        const pad = document.createElement('yam-beat')
        const clazz = [1, 2, 4, 5].includes(i) ? 'diamond' : 'block'

        pad.classList.add('beat')
        pad.classList.add(clazz)
        pad.beat = `${i + 1}`

        pads.push(pad)
      }

      div.replaceChildren(...pads)
    } else {
      const pads = [...Array(beats).keys()].map((v) => {
        const block = document.createElement('yam-beat')

        block.classList.add('beat')
        block.classList.add('block')
        block.beat = `${v + 1}`

        return block
      })

      div.replaceChildren(...pads)
    }
  }
}

customElements.define('yam-pads', Pads)
