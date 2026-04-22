import * as datastore from '../datastore/datastore.js'
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

  #timeSignature = '4:4'
  #track = null
  #bar = -1

  #handlers = {
    ul: {
      click: (event) => {
        const list = this.shadowRoot.querySelector('#list')

        if (event.target.dataset.timeSignature != null) {
          this.timeSignature = event.target.dataset.timeSignature

          list.hidePopover()
          this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: event.target.dataset.timeSignature } }))
        } else if (event.target.parentElement?.dataset.timeSignature != null) {
          this.timeSignature = event.target.parentElement.dataset.timeSignature

          list.hidePopover()
          this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: event.target.parentElement.dataset.timeSignature } }))
        }
      },
    },

    tactus: {
      change: (event) => {
        this.#beats = event.detail.beats
        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: this.timeSignature } }))
      },

      changed: (event) => {
        this.#beats = event.detail.beats
        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: this.timeSignature } }))
      },
    },

    figura: {
      change: (event) => {
        this.#divisions = event.detail.divisions
        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: this.timeSignature } }))
      },

      changed: (event) => {
        this.#divisions = event.detail.divisions
        this.dispatchEvent(new CustomEvent('change', { detail: { timeSignature: this.timeSignature } }))
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
        const container = this.shadowRoot.querySelector('div.time-signature')

        if (container.classList.contains('locked')) {
          container.classList.add('tapped')
        }
      },
    },

    lock: {
      animated: () => {
        this.shadowRoot.querySelector('div.time-signature')?.classList.remove('tapped')
      },
    },
  }

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
    const ul = shadow.querySelector('div.content ul')
    const tactus = shadow.querySelector('yam-tactus')
    const figura = shadow.querySelector('yam-figura')
    const button = shadow.querySelector('[popovertarget]')
    const overlay = shadow.querySelector('div.overlay')
    const lock = shadow.querySelector('#lock')

    ul.addEventListener('click', this.#handlers.ul.click)
    tactus.addEventListener('change', this.#handlers.tactus.change)
    tactus.addEventListener('changed', this.#handlers.tactus.changed)
    figura.addEventListener('change', this.#handlers.figura.change)
    figura.addEventListener('changed', this.#handlers.figura.changed)

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

  get timeSignature() {
    return this.#timeSignature
  }

  set timeSignature(v) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.time-signature')
    const tactus = shadow.querySelector('yam-tactus')
    const figura = shadow.querySelector('yam-figura')

    if (v === '') {
      this.#timeSignature = ``
      tactus.beats = 4
      figura.divisions = 4
    } else if (v == 'common') {
      this.#timeSignature = `common`
      tactus.beats = 4
      figura.divisions = 4
    } else if (v == 'cut') {
      this.#timeSignature = `cut`
      tactus.beats = 2
      figura.divisions = 2
    } else {
      const { beats, divisions } = parse(`${v}`)

      if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
        this.#timeSignature = `${beats}:${divisions}`

        tactus.beats = beats
        figura.divisions = divisions
      }
    }

    if (v === '') {
      container.classList.add('none')
    } else {
      container.classList.remove('none')
    }

    this.#redraw(this.timeSignature)
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

  set track(v) {
    const track = datastore.tracks.get(v)

    this.#track = track
    this.#bar = -1
    this.locked = track != null && track.sections != null && track.sections.length > 0

    if (track != null) {
      this.timeSignature = track.timeSignature
    }
  }

  redraw({ playing, stopped, bar }) {
    const track = this.#track

    if (track != null && bar != this.#bar) {
      this.#bar = bar

      if (!playing && stopped) {
        // NTS: use this.#timeSignature - tracks without sections/subsections allow the
        //      time signature to be set from the UI
        this.#redraw(this.#timeSignature)
        // this.#redraw(track.timeSignature)
      }

      if (playing && !stopped) {
        const sections = track.sections ?? []
        const section = sections.findLast((v) => v.start <= bar)
        const subsections = section?.subsections ?? []
        const subsection = subsections.findLast((v) => v.start <= bar)

        if (subsection != null) {
          this.#redraw(subsection.timeSignature)
        } else if (section != null) {
          this.#redraw(section.timeSignature)
        } else {
          // NTS: use this.#timeSignature - tracks without sections/subsections allow the
          //      time signature to be set from the UI
          this.#redraw(this.#timeSignature)
          // this.#redraw(track.timeSignature)
        }
      }
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

  #redraw(timeSignature) {
    const tactus = {
      span: this.shadowRoot.querySelector('button div span.icon-tactus'),
      img: this.shadowRoot.querySelector('button div img.tactus'),
    }

    const figura = {
      span: this.shadowRoot.querySelector('button div span.icon-figura'),
      img: this.shadowRoot.querySelector('button div img.figura'),
    }

    const common = {
      span: this.shadowRoot.querySelector('button div span.icon-common'),
      img: this.shadowRoot.querySelector('button div img.common'),
    }

    const cut = {
      span: this.shadowRoot.querySelector('button div span.icon-cut'),
      img: this.shadowRoot.querySelector('button div img.cut'),
    }

    const { beats, divisions } = parse(timeSignature)

    switch (true) {
      case timeSignature === '':
        tactus.span.classList.add('hidden')
        tactus.img.classList.add('hidden')
        figura.span.classList.add('hidden')
        figura.img.classList.add('hidden')
        common.span.classList.add('hidden')
        common.img.classList.add('hidden')
        cut.span.classList.add('hidden')
        cut.img.classList.add('hidden')
        break

      case timeSignature === 'common':
        tactus.span.classList.add('hidden')
        tactus.img.classList.add('hidden')
        figura.span.classList.add('hidden')
        figura.img.classList.add('hidden')
        common.span.classList.remove('hidden')
        common.img.classList.remove('hidden')
        cut.span.classList.add('hidden')
        cut.img.classList.add('hidden')
        break

      case timeSignature === 'cut':
        tactus.span.classList.add('hidden')
        tactus.img.classList.add('hidden')
        figura.span.classList.add('hidden')
        figura.img.classList.add('hidden')
        common.span.classList.add('hidden')
        common.img.classList.add('hidden')
        cut.span.classList.remove('hidden')
        cut.img.classList.remove('hidden')
        break

      default:
        tactus.span.classList.remove('hidden')
        tactus.img.classList.remove('hidden')
        figura.span.classList.remove('hidden')
        figura.img.classList.remove('hidden')
        common.span.classList.add('hidden')
        common.img.classList.add('hidden')
        cut.span.classList.add('hidden')
        cut.img.classList.add('hidden')

        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          if (TACTUS.has(`${beats}`)) {
            const img = TACTUS.get(`${beats}`)
            tactus.span.style.maskImage = `url('${img}')`
            tactus.img.src = img
          }

          if (FIGURA.has(`${divisions}`)) {
            const img = FIGURA.get(`${divisions}`)

            figura.span.style.maskImage = `url('${img}')`
            figura.img.src = img
          }
        }
    }
  }
}

customElements.define('yam-time-signature', TimeSignature)
