import * as generators from '../generators.js'
import { parseTimeSignature as parse } from '../util.js'

const TACTUS = new Map([
  ['1', './images/time-signatures/tactus/1.svg'],
  ['2', './images/time-signatures/tactus/2.svg'],
  ['3', './images/time-signatures/tactus/3.svg'],
  ['4', './images/time-signatures/tactus/4.svg'],
  ['5', './images/time-signatures/tactus/5.svg'],
  ['6', './images/time-signatures/tactus/6.svg'],
  ['7', './images/time-signatures/tactus/7.svg'],
  ['8', './images/time-signatures/tactus/8.svg'],
  ['9', './images/time-signatures/tactus/9.svg'],
  ['10', './images/time-signatures/tactus/10.svg'],
  ['11', './images/time-signatures/tactus/11.svg'],
  ['12', './images/time-signatures/tactus/12.svg'],
  ['13', './images/time-signatures/tactus/13.svg'],
  ['14', './images/time-signatures/tactus/14.svg'],
  ['15', './images/time-signatures/tactus/15.svg'],
  ['16', './images/time-signatures/tactus/16.svg'],
  ['17', './images/time-signatures/tactus/17.svg'],
  ['18', './images/time-signatures/tactus/18.svg'],
  ['19', './images/time-signatures/tactus/19.svg'],
  ['20', './images/time-signatures/tactus/20.svg'],
  ['21', './images/time-signatures/tactus/21.svg'],
  ['22', './images/time-signatures/tactus/22.svg'],
  ['23', './images/time-signatures/tactus/23.svg'],
  ['24', './images/time-signatures/tactus/24.svg'],
  ['25', './images/time-signatures/tactus/25.svg'],
  ['26', './images/time-signatures/tactus/26.svg'],
  ['27', './images/time-signatures/tactus/27.svg'],
  ['28', './images/time-signatures/tactus/28.svg'],
  ['29', './images/time-signatures/tactus/29.svg'],
  ['30', './images/time-signatures/tactus/30.svg'],
  ['31', './images/time-signatures/tactus/31.svg'],
  ['32', './images/time-signatures/tactus/32.svg'],
])

const FIGURA = new Map([
  ['1', './images/time-signatures/figura/1.svg'],
  ['2', './images/time-signatures/figura/2.svg'],
  ['4', './images/time-signatures/figura/4.svg'],
  ['8', './images/time-signatures/figura/8.svg'],
  ['16', './images/time-signatures/figura/16.svg'],
  ['32', './images/time-signatures/figura/32.svg'],
])

export class TimeSignature extends HTMLElement {
  static get observedAttributes() {
    return ['disabled', 'locked']
  }

  #track = {
    sections: new Map(),
  }

  #timeSignature = '4:4'

  constructor() {
    super()

    const template = document.querySelector('#template-time-signature')
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
    this.classList.add('component-time-signature')

    const shadow = this.shadowRoot
    const list = shadow.querySelector('#list')
    const ul = shadow.querySelector('div.content ul')
    const tactus = shadow.querySelector('input#tactus')
    const figura = shadow.querySelector('input#figura')

    ul.addEventListener('click', (event) => {
      if (event.target.dataset.timeSignature != null) {
        this.timeSignature = event.target.dataset.timeSignature

        list.hidePopover()
        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: event.target.dataset.timeSignature } }))
      } else if (event.target.parentElement?.dataset.timeSignature != null) {
        this.timeSignature = event.target.parentElement.dataset.timeSignature

        list.hidePopover()
        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: event.target.parentElement.dataset.timeSignature } }))
      }
    })

    tactus.addEventListener('input', () => {
      if (tactus.checkValidity()) {
        this.#beats = tactus.value

        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: this.timeSignature } }))
      }
    })

    figura.addEventListener('input', () => {
      if (figura.checkValidity()) {
        this.#divisions = figura.value
        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: this.timeSignature } }))
      }
    })
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

  get timeSignature() {
    return this.#timeSignature
  }

  set timeSignature(v) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.time-signature')
    const tactus = shadow.querySelector('input#tactus')
    const figura = shadow.querySelector('input#figura')

    if (v === '') {
      this.#timeSignature = ``
      tactus.value = ''
      figura.value = ''
    } else if (v == 'common') {
      this.#timeSignature = `common`
      tactus.value = 4
      figura.value = 4
    } else if (v == 'cut') {
      this.#timeSignature = `cut`
      tactus.value = 2
      figura.value = 2
    } else {
      const { beats, divisions } = parse(`${v}`)

      if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
        this.#timeSignature = `${beats}:${divisions}`

        tactus.value = beats
        figura.value = divisions
      }
    }

    if (v === '') {
      container.classList.add('none')
    } else {
      container.classList.remove('none')
    }

    this.#redraw()
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

  set track(track) {
    const sections = transmogrify(track)

    this.#track = {
      sections: new Map(sections.map((v) => [v.ID, v])),
    }
  }

  get #disabled() {
    return this.getAttribute('disabled') != null
  }

  set #disabled(v) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.time-signature')
    const button = shadow.querySelector('button')

    if (v === true) {
      button.disabled = true
      container.classList.add('disabled')
    } else {
      button.disabled = this.#locked
      container.classList.remove('disabled')
    }
  }

  get #locked() {
    return this.getAttribute('locked') != null
  }

  set #locked(v) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.time-signature')
    const button = shadow.querySelector('button')

    if (v === true) {
      button.disabled = true
      container.classList.add('locked')
    } else {
      button.disabled = this.#disabled
      container.classList.remove('locked')
    }
  }

  redraw(timeSignature, { playing, stopped, section }) {
    if (playing || stopped) {
      const _section = this.#track.sections.get(section.ID) ?? this.#track.sections.get(1)

      if (_section?.timeSignature !== this.#timeSignature) {
        this.timeSignature = _section?.timeSignature ?? timeSignature
      }
    } else {
      this.timeSignature = timeSignature
    }
  }

  set #beats(v) {
    const beats = parseInt(`${v}`)
    const { divisions } = parse(`${this.#timeSignature}`)

    if (!Number.isNaN(beats) && TACTUS.has(`${beats}`)) {
      this.timeSignature = `${beats}:${divisions}`
    }
  }

  set #divisions(v) {
    const { beats } = parse(`${this.#timeSignature}`)
    const divisions = parseInt(`${v}`)

    if (!Number.isNaN(divisions) && FIGURA.has(`${divisions}`)) {
      this.timeSignature = `${beats}:${divisions}`
    }
  }

  #redraw() {
    const shadow = this.shadowRoot
    const tactus = shadow.querySelector('button div img.tactus')
    const figura = shadow.querySelector('button div img.figura')
    const common = shadow.querySelector('button div img.common')
    const cut = shadow.querySelector('button div img.cut')

    if (`${this.timeSignature}` === '') {
      tactus.classList.add('hidden')
      figura.classList.add('hidden')
      common.classList.add('hidden')
      cut.classList.add('hidden')
    } else if (`${this.timeSignature}` === 'common') {
      tactus.classList.add('hidden')
      figura.classList.add('hidden')
      common.classList.remove('hidden')
      cut.classList.add('hidden')
    } else if (`${this.timeSignature}` === 'cut') {
      tactus.classList.add('hidden')
      figura.classList.add('hidden')
      common.classList.add('hidden')
      cut.classList.remove('hidden')
    } else {
      tactus.classList.remove('hidden')
      figura.classList.remove('hidden')
      common.classList.add('hidden')
      cut.classList.add('hidden')

      const { beats, divisions } = parse(this.timeSignature)
      if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
        if (TACTUS.has(`${beats}`)) {
          tactus.src = TACTUS.get(`${beats}`)
        }

        if (FIGURA.has(`${divisions}`)) {
          figura.src = FIGURA.get(`${divisions}`)
        }
      }
    }
  }
}

function transmogrify(track) {
  return [...generators.transmogrify(track)].map((v) => {
    return {
      ID: v.ID,
      start: v.start,
      timeSignature: v.timeSignature,
    }
  })
}

customElements.define('yam-time-signature', TimeSignature)
