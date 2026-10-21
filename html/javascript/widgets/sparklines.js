import { EVENTS } from '../constants.js'

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const COLOURS = [
  '#D96C5F', // stronger coral
  '#8E6BBE', // richer lavender
  '#C7924A', // deeper sand/gold
  '#4F7FC1', // clearer blue
  '#B86B77', // darker dusty rose
  '#6E8F52', // stronger sage
  '#4F7775', // darker teal
]

export class Sparklines extends HTMLElement {
  static get observedAttributes() {
    return ['labels']
  }

  #statistics = null
  #track = null
  #played = []

  #style = {
    labels: 'weekdays-small',
    fonts: {
      normal: '20px sans-serif',
      small: '16px sans-serif',
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-sparklines')
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
    this.classList.add('component-sparklines')

    const style = getComputedStyle(this)

    this.#style.fonts.normal = style.getPropertyValue('--weekdays-font').trim() || '20px sans-serif'
    this.#style.fonts.small = style.getPropertyValue('--weekdays-small-font').trim() || '16px sans-serif'

    this.resizeObserver = new ResizeObserver(([_entry]) => {
      const div = this.shadowRoot.querySelector('div')
      const style = div.currentStyle || window.getComputedStyle(div)

      const canvas = this.shadowRoot.querySelector('canvas')
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1

      const w = div.offsetWidth - (parseFloat(style.paddingLeft) + parseFloat(style.paddingRight))
      const h = div.offsetHeight - (parseFloat(style.paddingTop) + parseFloat(style.paddingBottom))

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.imageSmoothingEnabled = false

      this.#redraw()
    })

    this.resizeObserver.observe(this)
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect()
  }

  adoptedCallback() {}

  attributeChangedCallback(name, _from, to) {
    if (name === 'labels') {
      this.#style.labels = to
    }
  }

  set statistics(v) {
    this.#statistics = v

    v.addEventListener(EVENTS.STATISTICS_UPDATED, (e) => {
      if (this.#track != null && this.#track !== '' && e.detail.track === this.#track) {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const day = now.getDate()
        const from = new Date(year, month, day - 14)

        this.#played = this.#statistics?.query(this.#track, from, now)?.played ?? []
        this.#redraw()
      }
    })
  }

  set track(v) {
    const UUID = v?.UUID ?? ''

    if (UUID === '') {
      this.#track = ''
      this.#played = []
    } else {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth()
      const day = now.getDate()
      const from = new Date(year, month, day - 14)

      this.#track = UUID
      this.#played = this.#statistics?.query(UUID, from, now)?.played ?? []
    }

    this.#redraw()
  }

  refresh() {
    this.#redraw()
  }

  #redraw() {
    const style = getComputedStyle(this)
    const canvas = this.shadowRoot.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    const width = canvas.width
    const height = canvas.height
    const textColour = style.getPropertyValue('--sparklines-text').trim() || '#222222'
    const lineColour = style.getPropertyValue('--sparklines-lines').trim() || '#44444480'

    ctx.fillStyle = 'transparent'
    ctx.clearRect(0, 0, width, height)
    ctx.fillRect(0, 0, width, height)

    if (this.#played.length > 0) {
      // ... layout
      let N = this.#played.length * 2
      let gaps = 0

      if (this.#played.length > 7) {
        this.#played.slice(1).forEach((record) => {
          if (record.date.getDay() === 1) {
            gaps += 1
          }
        })
      }

      const dw = width / (N + gaps)
      const cw = Math.min(28, dw * 0.9)
      const bars = [1 * dw]

      this.#played.slice(1).reduce((a, record) => {
        a += 2
        if (this.#played.length > 7 && record.date.getDay() === 1) {
          a += 1
        }

        bars.push(a * dw)

        return a
      }, 1)

      this.#played.slice(1).reduce((a, record) => {
        a += 2
        if (this.#played.length > 7 && record.date.getDay() === 1) {
          a += 1
        }

        return a
      }, 1)

      // ... grid
      const max = 8
      const grid = Array.from(harmonics(max))

      ctx.beginPath()
      ctx.strokeStyle = lineColour
      ctx.lineWidth = 0.5

      for (const line of grid) {
        const H = height - 2
        const y = (line * height) / 2.25

        ctx.moveTo(0, H - y)
        ctx.lineTo(width, H - y)
      }

      ctx.stroke()

      // ... bars (harmonic series)
      this.#played.forEach((record, ix) => {
        const x = bars[ix]
        const n = Math.min(record.played, max)
        const r = 1.25

        let sum = 0
        for (let i = 1; i <= n; i++) {
          sum += 1 / (r * i)
        }

        const h = Math.min(height, height * (sum / 2.25))

        ctx.fillStyle = COLOURS[ix % COLOURS.length]
        ctx.fillRect(x - cw / 2, height - h - 2, cw, h)
      })

      // ... weekdays labels
      if (this.#style.labels === 'weekdays') {
        const days = this.#played.map((v) => WEEKDAYS[v.date.getDay()])

        days.forEach((day, ix) => {
          const x = bars[ix]

          ctx.font = this.#style.fonts.normal
          ctx.textAlign = 'center'
          ctx.fillStyle = textColour
          ctx.fillText(day, x, height - 4)
        })
      }

      if (this.#style.labels === 'weekdays-small') {
        const days = this.#played.map((v) => WEEKDAYS[v.date.getDay()])

        days.forEach((day, ix) => {
          const x = bars[ix]

          ctx.font = this.#style.fonts.small
          ctx.textAlign = 'center'
          ctx.fillStyle = textColour
          ctx.fillText(day, x, height - 6)
        })
      }
    }
  }
}

function* harmonics(N, r = 1.25) {
  let sum = 0
  yield sum

  for (let k = 1; k <= N; k++) {
    sum += 1 / (k * r)
    yield sum.toFixed(4)
  }
}

customElements.define('yam-sparklines', Sparklines)
