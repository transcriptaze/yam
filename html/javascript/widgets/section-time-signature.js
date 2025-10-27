import { DIVISIONS, EVENTS } from '../constants.js'

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

export class SectionTimeSignature extends HTMLElement {
  static get observedAttributes() {
    return ['disabled']
  }

  #timeSignature = '4:4'
  #defaults = {
    timeSignature: '4:4',
  }

  #handlers = {
    ul: {
      click: (event) => {
        const list = this.shadowRoot.querySelector('#list')

        if (event.target.dataset.timeSignature != null) {
          this.timeSignature = {
            timeSignature: event.target.dataset.timeSignature,
          }

          list.hidePopover()

          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_TIME_SIGNATURE_CHANGE, {
              bubbles: true,
              composed: true,
              detail: {
                timeSignature: this.timeSignature,
              },
            }),
          )
        } else if (event.target.parentElement?.dataset.timeSignature != null) {
          this.timeSignature = {
            timeSignature: event.target.parentElement.dataset.timeSignature,
          }

          list.hidePopover()

          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_TIME_SIGNATURE_CHANGE, {
              bubbles: true,
              composed: true,
              detail: {
                timeSignature: this.timeSignature,
              },
            }),
          )
        }
      },
    },

    tactus: {
      change: (event) => {
        this.#beats = event.detail.beats

        const { beats, divisions } = parseTimeSignature(this.timeSignature)

        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_TIME_SIGNATURE_CHANGE, {
              bubbles: true,
              composed: true,
              detail: { timeSignature: this.timeSignature },
            }),
          )
        }
      },

      changed: (event) => {
        this.#beats = event.detail.beats

        const { beats, divisions } = parseTimeSignature(this.timeSignature)

        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_TIME_SIGNATURE_CHANGE, {
              bubbles: true,
              composed: true,
              detail: { timeSignature: this.timeSignature },
            }),
          )
        }
      },
    },

    figura: {
      change: (event) => {
        this.#divisions = event.detail.divisions

        const { beats, divisions } = parseTimeSignature(this.timeSignature)

        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_TIME_SIGNATURE_CHANGE, {
              bubbles: true,
              composed: true,
              detail: { timeSignature: this.timeSignature },
            }),
          )
        }
      },

      changed: (event) => {
        this.#divisions = event.detail.divisions

        const { beats, divisions } = parseTimeSignature(this.timeSignature)

        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          this.dispatchEvent(
            new CustomEvent(EVENTS.SECTION_TIME_SIGNATURE_CHANGE, {
              bubbles: true,
              composed: true,
              detail: { timeSignature: this.timeSignature },
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

    const template = document.querySelector('#template-section-time-signature')
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
    this.classList.add('component-section-time-signature')

    const shadow = this.shadowRoot
    const ul = shadow.querySelector('div.content ul')
    const tactus = shadow.querySelector('yam-tactus')
    const figura = shadow.querySelector('yam-figura')
    const button = shadow.querySelector('[popovertarget]')

    ul.addEventListener('click', this.#handlers.ul.click)
    tactus.addEventListener('change', this.#handlers.tactus.change)
    tactus.addEventListener('changed', this.#handlers.tactus.changed)
    figura.addEventListener('change', this.#handlers.figura.change)
    figura.addEventListener('changed', this.#handlers.figura.changed)

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
  }

  get timeSignature() {
    return this.#timeSignature
  }

  set timeSignature({ timeSignature, defaults }) {
    const shadow = this.shadowRoot
    const tactus = shadow.querySelector('yam-tactus')
    const figura = shadow.querySelector('yam-figura')
    const { beats, divisions } = parseTimeSignature(`${timeSignature}`)

    if (defaults != null && defaults.timeSignature != null) {
      this.#defaults.timeSignature = defaults.timeSignature
    }

    switch (true) {
      case timeSignature === '':
        this.#timeSignature = ``
        tactus.beats = ''
        figura.divisions = ''
        break

      case timeSignature == 'common':
        this.#timeSignature = `common`
        tactus.beats = 4
        figura.divisions = 4
        break

      case timeSignature == 'cut':
        this.#timeSignature = `cut`
        tactus.beats = 2
        figura.divisions = 2
        break

      default:
        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          this.#timeSignature = `${beats}:${divisions}`
          tactus.beats = beats
          figura.divisions = divisions
        } else if (!Number.isNaN(beats)) {
          this.#timeSignature = `${beats}:`
          tactus.beats = beats
          figura.divisions = ''
        } else if (!Number.isNaN(divisions)) {
          this.#timeSignature = `:${divisions}`
          tactus.beats = ''
          figura.divisions = divisions
        }
    }

    this.#redraw()
  }

  set defaults(object) {
    const timeSignature = object?.timeSignature ?? ''

    if (timeSignature !== '') {
      this.#defaults.timeSignature = timeSignature
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
      button.disabled = false
      container.classList.remove('disabled')
    }
  }

  set #beats(v) {
    const beats = parseInt(`${v}`)
    const { divisions } = parseTimeSignature(`${this.#timeSignature}`)

    if (!Number.isNaN(beats) && TACTUS.has(`${beats}`)) {
      if (DIVISIONS.includes(divisions)) {
        this.#timeSignature = `${beats}:${divisions}`
      } else {
        this.#timeSignature = `${beats}:`
      }
    }

    this.#redraw()
  }

  set #divisions(v) {
    const { beats } = parseTimeSignature(`${this.#timeSignature}`)
    const divisions = parseInt(`${v}`)

    if (!Number.isNaN(divisions) && FIGURA.has(`${divisions}`)) {
      if (TACTUS.has(`${beats}`)) {
        this.#timeSignature = `${beats}:${divisions}`
      } else {
        this.#timeSignature = `:${divisions}`
      }
    }

    this.#redraw()
  }

  #redraw() {
    const container = this.shadowRoot.querySelector('div.time-signature')
    const tactus = this.shadowRoot.querySelector('button div img.tactus')
    const figura = this.shadowRoot.querySelector('button div img.figura')
    const common = this.shadowRoot.querySelector('button div img.common')
    const cut = this.shadowRoot.querySelector('button div img.cut')

    const timeSignature = this.#timeSignature
    const defval = this.#defaults.timeSignature

    if (timeSignature === '') {
      container.classList.add('none')
      tactus.classList.add('hidden')
      figura.classList.add('hidden')
      common.classList.add('hidden')
      cut.classList.add('hidden')

      if (defval === 'common') {
        tactus.classList.remove('placeholder')
        figura.classList.remove('placeholder')
        common.classList.add('placeholder')
        cut.classList.remove('placeholder')
      } else if (defval === 'cut') {
        tactus.classList.remove('placeholder')
        figura.classList.remove('placeholder')
        common.classList.remove('placeholder')
        cut.classList.add('placeholder')
      } else if (defval !== '') {
        tactus.classList.add('placeholder')
        figura.classList.add('placeholder')
        common.classList.remove('placeholder')
        cut.classList.remove('placeholder')

        const { beats, divisions } = parseTimeSignature(defval)
        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          if (TACTUS.has(`${beats}`)) {
            tactus.src = TACTUS.get(`${beats}`)
          }

          if (FIGURA.has(`${divisions}`)) {
            figura.src = FIGURA.get(`${divisions}`)
          }
        }
      }
    } else {
      container.classList.remove('none')
      tactus.classList.remove('placeholder')
      figura.classList.remove('placeholder')
      common.classList.remove('placeholder')
      cut.classList.remove('placeholder')
    }

    if (timeSignature === 'common') {
      tactus.classList.add('hidden')
      figura.classList.add('hidden')
      common.classList.remove('hidden')
      cut.classList.add('hidden')
    } else if (timeSignature === 'cut') {
      tactus.classList.add('hidden')
      figura.classList.add('hidden')
      common.classList.add('hidden')
      cut.classList.remove('hidden')
    } else if (timeSignature !== '') {
      tactus.classList.remove('hidden')
      figura.classList.remove('hidden')
      common.classList.add('hidden')
      cut.classList.add('hidden')

      const { beats, divisions } = parseTimeSignature(timeSignature)

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

// NTS: handles partial time signatures (unlike util::parseTimesignature)
function parseTimeSignature(v) {
  if (`${v}` === 'common') {
    return { beats: 4, divisions: 4 }
  }

  if (`${v}` === 'cut') {
    return { beats: 2, divisions: 2 }
  }

  const timeSignature = {
    beats: Number.NaN,
    divisions: Number.NaN,
  }

  const matches = `${v}`.match(/([0-9]+)?:([0-9]+)?/)

  if (matches != null) {
    const beats = parseInt(matches[1])
    const divisions = parseInt(matches[2])

    if (!Number.isNaN(beats) && beats >= 1 && beats <= 12) {
      timeSignature.beats = beats
    }

    if (!Number.isNaN(divisions) && DIVISIONS.includes(divisions)) {
      timeSignature.divisions = divisions
    }
  }

  return timeSignature
}

customElements.define('yam-section-time-signature', SectionTimeSignature)
