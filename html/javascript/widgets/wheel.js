import { clamp, sin, cos, abs } from './util.js'

const WEDGE = 30 // degrees
const R = 60
const D = 2 * R

export class Wheel extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #min = 40
  #max = 200
  #BPM = 120
  #value = 120
  #drag = {
    dragging: false,
    coarse: false,

    start: {
      x: 0,
      value: 120,
      timestamp: 0,
    },

    event: {
      x: 0,
      timestamp: 0,
    },

    x: {
      start: 0,
      last: 0,
      dx: 0,
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-wheel')
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
    const shadow = this.shadowRoot
    const overlay = shadow.querySelector('div.overlay')

    const animate = () => {
      if (this.#drag.dragging) {
        this.#recalculate()
        this.#redraw()

        const BPM = parseInt(`${this.#value}`, 10)

        if (BPM != this.#BPM) {
          this.#BPM = BPM
          this.dispatchEvent(new Event('change'))
        }

        requestAnimationFrame(animate)
      }
    }

    overlay.onpointerdown = (event) => {
      if (this.#onPointerDown(event)) {
        requestAnimationFrame(animate)
        return true
      }

      return false
    }

    overlay.onpointerup = (event) => {
      this.#onPointerUp(event, this.#drag)
    }
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  get BPM() {
    return this.#BPM
  }

  set BPM(v) {
    if (!this.#drag.dragging) {
      const bpm = parseInt(`${v}`, 10)
      if (!Number.isNaN(bpm) && bpm >= this.min && bpm <= this.max) {
        this.#value = bpm
        this.#BPM = bpm

        this.#redraw()
      }
    }
  }

  get min() {
    return this.#min
  }

  get max() {
    return this.#max
  }

  redraw(BPM, { playing, stopped }) {
    if ((playing || stopped) && BPM !== this.#BPM) {
      this.#value = BPM
      this.#BPM = BPM

      this.#redraw()
    }
  }

  #onPointerDown(event) {
    const overlay = event.currentTarget

    event.preventDefault()

    if (event.button === 0) {
      this.#drag.dragging = true
      this.#drag.coarse = matchMedia('(pointer:coarse)').matches

      this.#drag.start.x = event.clientX
      this.#drag.start.value = parseFloat(`${this.#value}`)
      this.#drag.start.timestamp = event.timeStamp

      this.#drag.event.x = event.clientX
      this.#drag.event.timestamp = event.timeStamp

      this.#drag.x.start = event.clientX
      this.#drag.x.last = event.clientX
      this.#drag.x.dx = 0

      // ... enable drag
      overlay.classList.add('dragging')
      overlay.onpointermove = (event) => this.#onPointerMove(event)
      overlay.setPointerCapture(event.pointerId)

      return true
    }

    return false
  }

  #onPointerUp(event, drag) {
    const overlay = event.currentTarget

    event.preventDefault()

    overlay.onpointermove = null
    overlay.releasePointerCapture(event.pointerId)

    if (drag.dragging) {
      drag.dragging = false

      // ... tap?
      const dt = event.timeStamp - drag.start.timestamp
      const delta = this.#value - drag.start.value

      if (dt < 125 && Math.abs(delta) < 5) {
        const increment = this.#tapped(drag)

        const bpm = parseInt(`${drag.start.value}`, 10)
        const bpmʼ = clamp(bpm + increment, this.min, this.max)

        this.#value = bpmʼ
        this.#BPM = bpmʼ

        this.dispatchEvent(new Event('change'))
      } else {
        const bpm = parseInt(`${this.#value}`, 10)
        if (!Number.isNaN(bpm) && bpm >= this.min && bpm <= this.max) {
          this.#value = bpm
          this.#BPM = bpm
        }
      }

      this.#redraw()
      this.dispatchEvent(new Event('changed'))

      return true
    }
  }

  #onPointerMove(event) {
    event.preventDefault()

    if (this.#drag.dragging) {
      this.#drag.event.x = event.clientX
      this.#drag.timestamp = event.timeStamp
      return true
    }

    return false
  }

  #tapped(drag) {
    const shadow = this.shadowRoot
    const overlay = shadow.querySelector('div.overlay')
    const bounds = overlay.getBoundingClientRect()
    const cx = bounds.left + bounds.width / 2
    const dx = drag.event.x - cx
    const tapped = Math.abs(dx) > 25 ? (dx > 0 ? '+' : '-') : ''

    switch (tapped) {
      case '+':
        return +1
      case '-':
        return -1
      default:
        return 0
    }
  }

  #recalculate() {
    const drag = this.#drag
    const range = this.max - this.min
    const scale = drag.coarse ? 540 : 360

    const u = drag.event.x
    const v = drag.x.last
    const ds = u - v
    const x = drag.x.start + (drag.x.dx + ds)
    const delta = x - drag.x.start

    this.#value = clamp(drag.start.value + (range * delta) / scale, this.min, this.max)

    // NTS: anti-windup
    const deltaʼ = ((this.#value - drag.start.value) * scale) / range
    const xʼ = deltaʼ + drag.x.start

    drag.x.dx = xʼ - drag.x.start
    drag.x.last = drag.event.x
  }

  #redraw() {
    const redraw = () => {
      const shadow = this.shadowRoot
      const svg = shadow.querySelector('svg')
      const labels = svg.querySelectorAll('#labels .label')
      const knurls = svg.querySelectorAll('#knurls .knurl')

      const range = this.max - this.min
      const BPM = this.#value
      const rotation = ((BPM - 120) * (360 - WEDGE)) / range

      for (const label of labels) {
        const offset = parseFloat(`${label.dataset.angle}`)

        if (!Number.isNaN(offset)) {
          const angle = rotation + offset
          let dx = R * sin(angle)
          const scale = abs(cos(angle))

          if (angle < -90) {
            dx = -D - dx
          } else if (angle > 90) {
            dx = +D - dx
          }

          label.setAttribute('transform', `translate(${dx},0) scale(${scale},1)`)
        }
      }

      for (const knurl of knurls) {
        const offset = parseFloat(`${knurl.dataset.angle}`)

        if (!Number.isNaN(offset)) {
          const angle = (360 + rotation + offset) % 360
          const angleʼ = (angle <= 90 ? angle : angle <= 270 ? angle + 180 : angle + 360) % 360
          const dx = R * sin(angleʼ)
          const scale = abs(cos(angleʼ))

          knurl.setAttribute('transform', `translate(${dx},0) scale(${scale},1)`)
        }
      }
    }

    const f1 = Math.round(this.#value * 10) / 10

    if (this.old !== f1) {
      this.old = f1
      redraw()
    }
  }
}

customElements.define('yam-wheel', Wheel)
