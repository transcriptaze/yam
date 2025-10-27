import { clamp, sin, cos, abs } from './util.js'

const R = 60
const D = 2 * R
const MIN = 1
const MAX = 12
const DELTA = 20.625 // degrees

const BEATS = new Map([
  [1, 12],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7],
  [7, 6],
  [8, 5],
  [9, 4],
  [10, 3],
  [11, 2],
  [12, 1],
  [13, ''],
])

const ZINDEX = 9

export class Tactus extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #beats = 4
  #value = 9
  #drag = {
    dragging: false,
    coarse: false,

    start: {
      x: 0,
      value: 3,
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

    const template = document.querySelector('#template-tactus')
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
    this.classList.add('component-tactus')

    const shadow = this.shadowRoot
    const overlay = shadow.querySelector('div.overlay')

    const animate = () => {
      if (this.#drag.dragging) {
        this.#recalculate()
        this.#redraw()

        const index = parseInt(`${this.#value}`, 10)

        if (BEATS.has(index)) {
          const beats = BEATS.get(index)
          if (beats != this.#beats) {
            this.#beats = beats
            // this.dispatchEvent(new CustomEvent('change', { detail: { beats: this.beats } }))
          }
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

  get beats() {
    return this.#beats
  }

  set beats(v) {
    if (!this.#drag.dragging) {
      const beats = parseInt(`${v}`, 10)
      const kv = Array.from(BEATS.entries()).find(([_, v]) => v === beats)
      const none = Array.from(BEATS.entries()).find(([_, v]) => v === '')

      if (kv != null) {
        this.#value = kv[0]
        this.#beats = kv[1]
      } else if (none != null) {
        this.#value = none[0]
        this.#beats = none[1]
      }

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

        const index = parseInt(`${drag.start.value}`, 10)
        const indexʼ = clamp(index + increment, MIN, MAX)

        if (BEATS.has(indexʼ)) {
          this.#value = indexʼ
          this.#beats = BEATS.get(indexʼ)

          // this.dispatchEvent(new CustomEvent('change', { detail: { divisions: this.divisions } }))
        }
      } else {
        const value = parseFloat(`${this.#value}`)
        const index = Math.round(value)

        if (BEATS.has(index)) {
          this.#value = index
          this.#beats = BEATS.get(index)
        }
      }

      this.#redraw()
      // this.dispatchEvent(new CustomEvent('changed', { detail: { divisions: this.divisions } }))

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
    const range = 7
    const scale = drag.coarse ? 540 : 360

    const u = drag.event.x
    const v = drag.x.last
    const ds = u - v
    const delta = drag.x.dx + ds

    this.#value = clamp(drag.start.value + (range * delta) / scale, MIN, MAX)

    // ... anti-windup
    const deltaʼ = ((this.#value - drag.start.value) * scale) / range

    drag.x.dx = deltaʼ
    drag.x.last = drag.event.x
  }

  #redraw() {
    const redraw = () => {
      const svg = this.shadowRoot.querySelector('svg')
      const labels = svg.querySelectorAll('#labels .label')
      const knurls = svg.querySelectorAll('#knurls .knurl')

      const index = this.#value
      const rotation = (index - ZINDEX) * DELTA

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

    // ... don't need to redraw every frame
    const f1 = Math.round(this.#value * 50) / 50

    if (this.old !== f1) {
      this.old = f1
      redraw()
    }
  }
}

customElements.define('yam-tactus', Tactus)
