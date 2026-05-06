const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const COLOURS = [
  '#F2B5A7', // soft coral
  '#BFA2DB', // light lavender
  '#E6C79C', // warm sand
  '#8FAADC', // gentle blue
  '#D4A5A5', // dusty rose
  '#A3B18A', // soft sage green
  '#6B8E8D', // muted teal
]

export class BarGraph extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #played = []

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

    this.resizeObserver = new ResizeObserver(() => {
      this.#redraw()
    })

    this.resizeObserver.observe(this)
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect()
  }

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set played(v) {
    this.#played = v
    this.#redraw()
  }

  #redraw() {
    const canvas = this.shadowRoot.querySelector('canvas')
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    ctx.scale(dpr, dpr)
    ctx.imageSmoothingEnabled = false

    if (canvas.width != canvas.clientWidth) {
      canvas.width = dpr * canvas.clientWidth
    }

    if (canvas.height != canvas.clientHeight) {
      canvas.height = dpr * canvas.clientHeight
    }

    const width = canvas.width
    const height = canvas.height

    ctx.clearRect(0, 0, width, height)

    if (this.#played.length > 0) {
      const N = this.#played.length
      const dw = Math.floor(width / (N * 2))
      const w = Math.min(28, dw)

      const max = this.#played.reduce((a, v) => (v.played > a ? v.played : a), 0)

      this.#played.forEach((record, ix) => {
        const x = (2 * ix + 1) * dw
        const h = 0.9 * Math.ceil((height * record.played) / max)

        ctx.fillStyle = COLOURS[ix % COLOURS.length]
        ctx.fillRect(Math.ceil(x - w / 2), height - h - 2, w, h)
      })

      if (N == 7) {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const day = now.getDate()

        const days = [
          WEEKDAYS[new Date(year, month, day - 6).getDay()],
          WEEKDAYS[new Date(year, month, day - 5).getDay()],
          WEEKDAYS[new Date(year, month, day - 4).getDay()],
          WEEKDAYS[new Date(year, month, day - 3).getDay()],
          WEEKDAYS[new Date(year, month, day - 2).getDay()],
          WEEKDAYS[new Date(year, month, day - 1).getDay()],
          WEEKDAYS[new Date(year, month, day).getDay()],
        ]

        days.forEach((day, ix) => {
          const x = (2 * ix + 1) * dw

          ctx.font = '20px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#000000'
          ctx.fillText(day, x, height - 2)
        })
      }
    }
  }
}

customElements.define('yam-bar-graph', BarGraph)
