import { sin, cos, atan2, hypot, clamp } from './util.js'

const WEDGE = 30 // degrees

export class Knob extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #min = 40
  #max = 200
  #BPM = 120
  #value = 120
  #tempo = Number.NaN

  constructor() {
    super()

    this.drag = {
      dragging: false,
      coarse: false,

      start: {
        x: 0,
        y: 0,
        value: 120,
        timestamp: 0,
      },

      angle: {
        attenuation: 'exponential',
        start: 0,
        last: {
          x: 0,
          y: 0,
        },
        angle: 0,
      },

      eventX: 0,
      eventY: 0,
      timestamp: 0,

      PID: {
        integral: 0,
        error: 0,
      },
    }

    const template = document.querySelector('#template-knob')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/web-components.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)
  }

  connectedCallback() {
    this.classList.add('component-knob')

    const shadow = this.shadowRoot
    const overlay = shadow.querySelector('div.overlay')

    overlay.addEventListener('pointerdown', this.#handlers.overlay.onPointerDown)
    overlay.addEventListener('pointerup', this.#handlers.overlay.onPointerUp)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  get BPM() {
    return this.#BPM
  }

  set BPM(v) {
    if (!this.drag.dragging) {
      const bpm = parseInt(`${v}`, 10)
      if (!Number.isNaN(bpm) && bpm >= this.min && bpm <= this.max) {
        this.#value = bpm
        this.#BPM = bpm

        this.#redraw(false)
      }
    }
  }

  get min() {
    return this.#min
  }

  get max() {
    return this.#max
  }

  set tempo(v) {
    const bpm = parseInt(`${v}`, 10)
    if (!Number.isNaN(bpm) && bpm >= this.min && bpm <= this.max) {
      this.#tempo = bpm
    } else {
      this.#tempo = Number.NaN
    }

    this.#redraw(true)
  }

  redraw(BPM, { playing, stopped }) {
    if ((playing || stopped) && BPM !== this.#BPM) {
      this.#value = BPM
      this.#BPM = BPM

      this.#redraw(false)
    }
  }

  #onPointerDown(event, drag) {
    const overlay = event.currentTarget
    const bounds = overlay.getBoundingClientRect()

    event.preventDefault()

    if (event.button === 0) {
      drag.dragging = true
      drag.coarse = matchMedia('(pointer:coarse)').matches
      drag.eventX = event.clientX
      drag.eventY = event.clientY
      drag.timestamp = event.timeStamp

      // ... drag + rotate (adjusted for clockwise rotation with 0° at bottom)
      const cx = bounds.left + bounds.width / 2
      const cy = bounds.top + bounds.height / 2
      const dx = cx - event.clientX
      const dy = cy - event.clientY

      drag.angle.start = (90 + atan2(dy, dx)) % 360
      drag.angle.last.x = event.clientX
      drag.angle.last.y = event.clientY
      drag.angle.angle = 0

      // ... drag + slide
      drag.start.x = event.clientX
      drag.start.y = event.clientY
      drag.start.value = parseFloat(`${this.#value}`)
      drag.start.timestamp = event.timeStamp

      // ... initialise PID
      drag.PID.integral = 0
      drag.PID.error = 0

      // ... enable drag
      overlay.classList.add('dragging')
      overlay.onpointermove = (event) => this.#onPointerMove(event, drag)
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

      this.#redraw(false)
      this.dispatchEvent(new Event('changed'))

      return true
    }
  }

  #onPointerMove(event, drag) {
    event.preventDefault()

    if (drag.dragging) {
      drag.eventX = event.clientX
      drag.eventY = event.clientY
      drag.timestamp = event.timeStamp
      return true
    }
  }

  #animate = () => {
    if (this.drag.dragging) {
      this.#recalculate()
      this.#redraw(false)

      const BPM = parseInt(`${this.#value}`, 10)

      if (BPM != this.#BPM) {
        this.#BPM = BPM
        this.dispatchEvent(new Event('change'))
      }

      requestAnimationFrame(this.#animate)
    }
  }

  #tapped(drag) {
    const value = drag.start.value
    const normalized = (value - this.min) / (this.max - this.min)
    const theta = normalized * (360 - WEDGE)
    const θ = WEDGE / 2 + theta

    const shadow = this.shadowRoot
    const overlay = shadow.querySelector('div.overlay')
    const bounds = overlay.getBoundingClientRect()
    const cx = bounds.left + bounds.width / 2
    const cy = bounds.top + bounds.height / 2
    const dx = drag.eventX - cx
    const dy = drag.eventY - cy
    const tapped = tap(dx, -dy, θ, drag.coarse)

    switch (tapped) {
      case '+':
        return +1
      case '-':
        return -1
      default:
        return 0
    }
  }

  #redraw(force) {
    const redraw = () => {
      const shadow = this.shadowRoot
      const svg = shadow.querySelector('svg.knob')

      // ... current
      {
        const dot = svg.querySelector('.dot')
        const ring = svg.querySelector('.indicator')

        const value = this.#value
        const min = this.min
        const max = this.max
        const normalized = (value - min) / (max - min)

        const r = this.#radius()
        const theta = normalized * (360 - WEDGE)
        const angle = WEDGE / 2 + theta

        const x0 = r * cos(WEDGE / 2)
        const y0 = r * sin(WEDGE / 2)
        const x1 = r * cos(angle)
        const y1 = r * sin(angle)

        // .. rotate by 90° and flip horizontally
        const X0 = -y0 // x0*cos(90) - y0*sin(90)
        const Y0 = x0 // x0*sin(90) + y0*cos(90)
        const X1 = -y1 // x1*cos(90) - y1*sin(90)
        const Y1 = x1 // x1*sin(90) + y1*cos(90)

        if (theta < 180) {
          ring.setAttribute('d', `M${X0},${Y0} A${r},${r},0,0,1,${X1},${Y1}`)
        } else {
          ring.setAttribute('d', `M${X0},${Y0} A${r},${r},0,1,1,${X1},${Y1}`)
        }

        dot.style.transform = `rotate(${angle}deg)`
      }

      // ... aspirational
      const red = svg.querySelector('.red')

      if (!Number.isNaN(this.#tempo) && this.#tempo >= 40 && this.#tempo <= 200) {
        const tempo = this.#tempo
        const value = this.#value
        const min = this.min
        const max = this.max
        const normalized1 = (tempo - min) / (max - min)
        const normalized2 = (value - min) / (max - min)

        const r = this.#radius() - 1.5
        const theta1 = normalized1 * (360 - WEDGE)
        const theta2 = normalized2 * (360 - WEDGE)
        const angle1 = WEDGE / 2 + theta1
        const angle2 = WEDGE / 2 + theta2

        const x0 = r * cos(angle1)
        const y0 = r * sin(angle1)
        const x1 = r * cos(angle2)
        const y1 = r * sin(angle2)

        // .. rotate by 90° and flip horizontally
        const X0 = -y0 // x0*cos(90) - y0*sin(90)
        const Y0 = x0 // x0*sin(90) + y0*cos(90)
        const X1 = -y1 // x1*cos(90) - y1*sin(90)
        const Y1 = x1 // x1*sin(90) + y1*cos(90)

        if (angle2 > angle1) {
          if (angle2 - angle1 < 180) {
            red.setAttribute('d', `M${X0},${Y0} A${r},${r},0,0,1,${X1},${Y1}`)
          } else {
            red.setAttribute('d', `M${X0},${Y0} A${r},${r},0,1,1,${X1},${Y1}`)
          }
        } else if (angle2 < angle1) {
          if (angle1 - angle2 < 180) {
            red.setAttribute('d', `M${X0},${Y0} A${r},${r},0,0,0,${X1},${Y1}`)
          } else {
            red.setAttribute('d', `M${X0},${Y0} A${r},${r},0,1,0,${X1},${Y1}`)
          }
        } else {
          red.setAttribute('d', ``)
        }
      } else {
        red.setAttribute('d', ``)
      }
    }

    const f1 = Math.round(this.#value * 10) / 10
    if (this.old !== f1 || force) {
      this.old = f1
      redraw()
    }
  }

  #radius() {
    const shadow = this.shadowRoot
    const svg = shadow.querySelector('svg.knob')
    const indicator = svg.getElementsByClassName('indicator')[0]
    const indicatorBG = svg.getElementsByClassName('indicator-bg')[0]

    const radius = parseFloat(indicatorBG.attributes.r.value)
    const edge = parseFloat(indicatorBG.attributes['stroke-width'].value)
    const stroke = parseFloat(indicator.attributes['stroke-width'].value)

    return radius - edge / 2 - stroke / 2
  }

  #recalculate() {
    // const Kp = 0.2
    // const Ki = 0.001
    // const Kd = 0.25

    const shadow = this.shadowRoot
    const overlay = shadow.querySelector('div.overlay')
    const bounds = overlay.getBoundingClientRect()
    const drag = this.drag

    const range = this.max - this.min

    // ... drag + rotate
    {
      const scale = drag.coarse ? 540 : 360
      const cx = bounds.left + bounds.width / 2
      const cy = bounds.top + bounds.height / 2

      const u = { x: drag.eventX - cx, y: -(drag.eventY - cy) }
      const v = { x: drag.angle.last.x - cx, y: -(drag.angle.last.y - cy) }
      const l1 = hypot(u.x, u.y)
      const l2 = hypot(v.x, v.y)
      const R = Math.max(0.001, l1 * l2)

      // NTS: attenuate movement near centre
      const attenuation = (() => {
        switch (drag.angle.attenuation) {
          case 'threshold':
            return threshold(R, 256)

          case 'quadratic':
            return quadratic(R, 64, 3)

          case 'exponential':
            return exponential(R, 8, 8)

          default:
            return threshold(R, 256)
        }
      })()

      const dot = (u.x * v.x + u.y * v.y) / R
      const cross = (v.x * u.y - v.y * u.x) / R
      const da = attenuation * atan2(cross, dot)
      const angle = drag.angle.start - (drag.angle.angle + da)
      const delta = angle - drag.angle.start

      this.#value = clamp(drag.start.value + (range * delta) / scale, this.min, this.max)

      // NTS: anti-windup
      const deltaʼ = ((this.#value - drag.start.value) * scale) / range
      const angleʼ = deltaʼ + drag.angle.start

      drag.angle.angle = drag.angle.start - angleʼ
      drag.angle.last.x = drag.eventX
      drag.angle.last.y = drag.eventY
    }

    // // ... drag + slide
    // {
    // const w = overlay.clientWidth
    // const h = overlay.clientHeight
    //   const dx = -(drag.start.x - drag.eventX) / (this.drag.coarse ? 5 : 5)
    //   const dy = (drag.start.y - drag.eventY) / (this.drag.coarse ? 2.5 : 2.5)
    //   const dr = range * (dx / w + dy / h)
    //   const r = drag.start.value + dr
    //
    //   const e = clamp(r, this.min, this.max) - this.#value
    //   const i = this.drag.PID.integral + e
    //   const d = e - this.drag.PID.error
    //   const delta = Kp * e + Ki * i + Kd * d
    //
    //   this.drag.PID.integral = i
    //   this.drag.PID.error = e
    //
    //   this.#value = clamp(this.#value + delta, this.min, this.max)
    // }
  }

  #handlers = {
    overlay: {
      onPointerDown: (event) => {
        if (this.#onPointerDown(event, this.drag)) {
          requestAnimationFrame(this.#animate)
          return true
        }

        return false
      },

      onPointerUp: (event) => {
        this.#onPointerUp(event, this.drag)
      },
    },
  }
}

const threshold = (r, R) => {
  return r > R ? 1 : 0
}

const quadratic = (r, b, a) => {
  return clamp(Math.pow(r / b, a), 0, 1)
}

const exponential = (r, T, c) => {
  const v = (r - c) / T

  return clamp(1 - Math.exp(-v), 0, 1)
}

// y = ax² + c
// ------------
// 5° parabola
// x = R·sin(5°) = 100 · sin(5°) = 8.715574274765817
// y = R·cos(5°) = 100 · cos(5°) = 99.61946980917456
//
// (0,-50)        :    -50 = a(0)²     + c => c = -50
// (8.716,99.619) : 99.619 = a(8.716)² + c => a = 1.9696819032682202
// ------------
// 45° parabola
// x = R·sin(45°) = 100 · sin(45°) = 70.71067811865474
// y = R·cos(45°) = 100 · cos(45°) = 70.71067811865476
//
// (0,0)           :      0 = a(0)²      + c => c = 0
// (70.710,70.710) : 70.710 = a(70.710)² + c => a = 0.014142135623730952
// ------------
// 75° parabola
// x = R·sin(75°) = 100 · sin(75°) = 96.59258262890683
// y = R·cos(75°) = 100 · cos(75°) = 25.88190451025207
//
// (0,0)           :      0 = a(0)²      + c => c = 0
// (96.592,25.881) : 25.881 = a(96.592)² + c => a = 0.002774014164840591

// prettier-ignore
const PARABOLA = {
  5:  { a: 1.969682, b: 0, c: -50 },
  45: { a: 0.014142, b: 0, c:  0 },
  75: { a: 0.002774, b: 0, c:  0 },
}

export function tap(x, y, θ, coarse) {
  const inside = (xy, parabola) => {
    const p = PARABOLA[`${parabola}`]
    const v = p.a * xy.x * xy.x + p.b * xy.x + p.c - xy.y

    return v <= 0
  }

  const xyʼ = transform(x, y, θ)
  const tapped = coarse ? inside(xyʼ, 75) && !inside(xyʼ, 5) : inside(xyʼ, 45) && !inside(xyʼ, 5)

  if (tapped && xyʼ.x > 0) {
    return '+'
  } else if (tapped && xyʼ.x < 0) {
    return '-'
  } else {
    return ''
  }
}

// Converts click {x,y} to knob co-ordinate system (clockwise, 0 at 6 o'clock)
// and aligns it with the knob 'value' angle
function transform(x, y, θ) {
  const θʼ = 180 + θ

  // prettier-ignore
  const T = [
    [cos(θʼ), -sin(θʼ)],
    [sin(θʼ),  cos(θʼ)],
  ]

  const xʼ = T[0][0] * x + T[0][1] * y
  const yʼ = T[1][0] * x + T[1][1] * y

  return { x: xʼ, y: yʼ }
}

customElements.define('yam-knob', Knob)
