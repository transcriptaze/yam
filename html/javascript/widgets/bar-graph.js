const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// const COLOURS = [
//   '#F2B5A7', // soft coral
//   '#BFA2DB', // light lavender
//   '#E6C79C', // warm sand
//   '#8FAADC', // gentle blue
//   '#D4A5A5', // dusty rose
//   '#A3B18A', // soft sage green
//   '#6B8E8D', // muted teal
// ]

const COLOURS = [
  '#D96C5F', // stronger coral
  '#8E6BBE', // richer lavender
  '#C7924A', // deeper sand/gold
  '#4F7FC1', // clearer blue
  '#B86B77', // darker dusty rose
  '#6E8F52', // stronger sage
  '#4F7775', // darker teal
]

const BACKGROUNDS = ['#ececec', '#e4e4e4']

export class BarGraph extends HTMLElement {
  static get observedAttributes() {
    return ['background', 'labels']
  }

  #played = []
  #style = {
    labels: '',
    background: null,
    fonts: {
      normal: '20px sans-serif',
      small: '16px sans-serif',
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-bar-graph')
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
    this.classList.add('component-bar-graph')

    const style = getComputedStyle(this)

    this.#style.fonts.normal = style.getPropertyValue('--weekdays-font').trim() || '20px sans-serif'
    this.#style.fonts.small = style.getPropertyValue('--weekdays-small-font').trim() || '16px sans-serif'

    this.resizeObserver = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const canvas = this.shadowRoot.querySelector('canvas')
      const ctx = canvas.getContext('2d')
      const dpr = window.devicePixelRatio || 1

      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)

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

    if (name === 'background') {
      this.#style.background = to
    }
  }

  set played(v) {
    this.#played = v
    this.#redraw()
  }

  #redraw() {
    const canvas = this.shadowRoot.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    const width = canvas.width
    const height = canvas.height

    ctx.fillStyle = '#ececec'
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
      const months = []

      this.#played.slice(1).reduce((a, record) => {
        a += 2
        if (this.#played.length > 7 && record.date.getDay() === 1) {
          a += 1
        }

        bars.push(a * dw)

        return a
      }, 1)

      this.#played.slice(1).reduce((a, record) => {
        const yesterday = a

        a += 2
        if (this.#played.length > 7 && record.date.getDay() === 1) {
          a += 1
        }

        if (record.date.getDate() === 1) {
          months.push((dw * (yesterday + a)) / 2)
        }

        return a
      }, 1)

      // ... month backgrounds
      if (this.#style.background === 'months') {
        let x = width
        let ix = 0

        months.reverse().forEach((v) => {
          ctx.fillStyle = BACKGROUNDS[ix % BACKGROUNDS.length]
          ctx.fillRect(v, 0, x - v, height)

          x = v
          ix++
        })

        ctx.fillStyle = BACKGROUNDS[ix % BACKGROUNDS.length]
        ctx.fillRect(0, 0, x, height)
      }

      // ... bars
      const max = this.#played.reduce((a, v) => (v.played > a ? v.played : a), 0)

      if (max > 0) {
        this.#played.forEach((record, ix) => {
          const x = bars[ix]
          const h = 0.9 * Math.ceil((height * record.played) / max)

          ctx.fillStyle = COLOURS[ix % COLOURS.length]
          ctx.fillRect(x - cw / 2, height - h - 2, cw, h)
        })
      }

      // ... weekdays labels
      if (this.#style.labels === 'weekdays') {
        const days = this.#played.map((v) => WEEKDAYS[v.date.getDay()])

        days.forEach((day, ix) => {
          const x = bars[ix]

          ctx.font = this.#style.fonts.normal
          ctx.textAlign = 'center'
          ctx.fillStyle = '#000000'
          ctx.fillText(day, x, height - 2)
        })
      }

      if (this.#style.labels === 'weekdays-small') {
        const days = this.#played.map((v) => WEEKDAYS[v.date.getDay()])

        days.forEach((day, ix) => {
          const x = bars[ix]

          ctx.font = this.#style.fonts.small
          ctx.textAlign = 'center'
          ctx.fillStyle = '#000000'
          ctx.fillText(day, x, height - 2)
        })
      }
    }
  }
}

customElements.define('yam-bar-graph', BarGraph)
