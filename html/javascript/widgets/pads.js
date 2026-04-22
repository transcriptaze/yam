import * as datastore from '../datastore/datastore.js'
import { parseTimeSignature } from '../util.js'

export class Pads extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #timeSignature = '4:4'
  #pulse = 'quarter'
  #track = null
  #last = {
    beat: Math.NaN,
    beats: -1,
    divisions: -1,
  }

  constructor() {
    super()

    const template = document.querySelector('#template-pads')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/widgets.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)
  }

  connectedCallback() {}

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set timeSignature(v) {
    const { beats, divisions } = parseTimeSignature(`${v}`)

    if (!Number.isNaN(beats) && !Number.isNaN(divisions) && `${beats}:${divisions}` !== this.#timeSignature) {
      this.#timeSignature = `${beats}:${divisions}`
      this.#layout(beats, divisions, this.#pulse)
    }
  }

  set pulse(v) {
    const { beats, divisions } = parseTimeSignature(this.#timeSignature)
    const pulse = `${v}`

    if (this.#pulse !== pulse) {
      this.#pulse = pulse

      this.#layout(beats, divisions, pulse)
    }
  }

  set track(v) {
    const track = datastore.tracks.get(v)

    this.#track = track

    if (track != null) {
      this.pulse = track.pulse
      this.timeSignature = track.timeSignature
    }
  }

  redraw({ playing, stopped, bar, beat }) {
    const track = this.#track

    if (track == null) {
      this.#redraw(beat, this.#timeSignature, this.#pulse)
      return
    }

    if (!playing && stopped) {
      this.#redraw(0, this.#timeSignature, this.#pulse)
      return
    }

    if (playing && !stopped) {
      const sections = track.sections ?? []
      const section = sections.findLast((v) => v.start <= bar)
      const subsections = section?.subsections ?? []
      const subsection = subsections.findLast((v) => v.start <= bar)
      const _beat = Number.parseFloat(beat, 10)

      if (subsection != null) {
        this.#redraw(beat, subsection.timeSignature, subsection.pulse)
      } else if (section != null) {
        this.#redraw(beat, section.timeSignature, section.pulse)
      } else {
        // NTS: use this.#timeSignature - tracks without sections/subsections allow the
        //      time signature to be set from the UI
        this.#redraw(beat, this.#timeSignature, track.pulse)
        // this.#redraw(beat, track.timeSignature, track.pulse)
      }
      return
    }
  }

  #redraw(beat, timeSignature, pulse) {
    const { beats, divisions } = parseTimeSignature(timeSignature)
    let invalidate = false

    if (!Number.isNaN(beats) && beats !== this.#last.beats && beats > 0 && beats <= 32) {
      this.#last.beats = beats
      invalidate = true
    }

    if (!Number.isNaN(divisions) && divisions !== this.#last.divisions && divisions > 0 && divisions <= 32) {
      this.#last.divisions = divisions
      invalidate = true
    }

    if (pulse != null && pulse !== this.#last.pulse) {
      this.#last.pulse = pulse
      invalidate = true
    }

    if (invalidate) {
      this.#layout(beats, divisions, pulse)
    }

    if (!Number.isNaN(beat) && beat !== this.#last.beat) {
      const shadow = this.shadowRoot
      const pads = shadow.querySelectorAll('.beat')

      pads.forEach((e) => e.redraw(beat))

      this.#last.beat = beat
    }
  }

  #layout(beats, divisions, pulse) {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.pads')

    if (divisions === 4 && pulse === 'eighth-doublet') {
      this.#eightDoublets(beats)
    } else if ([3, 6, 9, 12].includes(beats) && divisions === 8 && pulse === 'dotted-quarter') {
      this.#dottedQuarter(beats)
    } else if (beats === 5 && divisions === 4 && pulse === 'quarter') {
      this.#fiveFour(beats)
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

  #eightDoublets(beats) {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.pads')
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
  }

  #dottedQuarter(beats) {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.pads')
    const pads = []

    for (let i = 0; i < beats; i++) {
      const pad = document.createElement('yam-beat')
      const clazz = [2, 3, 5, 6, 8, 9, 11, 12].includes(i + 1) ? 'diamond' : 'block'

      pad.classList.add('beat')
      pad.classList.add(clazz)
      pad.beat = `${i + 1}`

      pads.push(pad)
    }

    div.replaceChildren(...pads)
  }

  #fiveFour() {
    const shadow = this.shadowRoot
    const div = shadow.querySelector('div.pads')
    const pads = []

    for (let i = 0; i < 5; i++) {
      const block = document.createElement('yam-beat')
      const clazz = [2, 4, 5].includes(i + 1) ? 'small-block' : 'block'

      block.classList.add('beat')
      block.classList.add(clazz)
      block.beat = `${i + 1}`

      pads.push(block)
    }

    div.replaceChildren(...pads)
  }
}

customElements.define('yam-pads', Pads)
