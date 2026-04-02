import { INF } from '../constants.js'

export class ProgressBar extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #bars = Number.POSITIVE_INFINITY
  #head = 0
  #subsections = []

  constructor() {
    super()

    const template = document.querySelector('#template-progress-bar')
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
    this.classList.add('component-progress-bar')
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  get head() {
    return this.#head
  }

  get bars() {
    return this.#bars
  }

  set value({ head, bars }) {
    const _head = Number.isNaN(head) || head === INF ? 0 : head
    const _bars = Number.isNaN(bars) || bars === INF ? 0 : bars
    let redraw = false

    if (_bars !== this.#bars) {
      this.#bars = Math.max(0, _bars)
      redraw = true
    }

    if (!Number.isNaN(_head) && _head !== this.#head) {
      this.#head = Math.min(Math.max(0, _head), this.#bars)
      redraw = true
    }

    if (redraw) {
      this.redraw()
    }
  }

  set subsections(v) {
    const subsections = []
    let start = 0

    for (const ss of v) {
      subsections.push({
        start: start,
        end: start + ss.measures,
        colour: ss.colour,
      })

      start += ss.measures
    }

    this.#subsections = subsections
  }

  redraw() {
    const style = getComputedStyle(this)
    const shadow = this.shadowRoot
    const canvas = shadow.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    if (canvas.width != canvas.clientWidth) {
      canvas.width = canvas.clientWidth
    }

    if (canvas.height != canvas.clientHeight) {
      canvas.height = canvas.clientHeight
    }

    const width = canvas.width
    const height = canvas.height
    const w = this.bars > 0 ? (width * this.head) / this.bars : 0
    const dw = this.bars > 0 ? width / this.bars : 0

    ctx.clearRect(0, 0, width, height)

    // ... fill with accent colour
    const underlay = style.getPropertyValue('--accent-color')

    if (underlay !== 'transparent') {
      ctx.fillStyle = faded(style.getPropertyValue('--accent-color'), 0.5)
      ctx.fillRect(0, 0, width, height)
    }

    // ... gradient function
    const g = (colour, x, xʼ) => {
      const startColour = faded(colour, 0)
      const gradient = ctx.createLinearGradient(x, 0, xʼ, 0)

      gradient.addColorStop(0, startColour)
      gradient.addColorStop(1, colour)

      ctx.fillStyle = `${faded(colour, 0.05)}`
      ctx.beginPath()
      ctx.rect(x, 0, xʼ - x, height)
      ctx.fill()

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.rect(x, 0.5, xʼ - x, height - 1)
      ctx.fill()
    }

    // ... gradient loop
    if (w > 0 && dw > 25) {
      let bar = 0
      for (let x = 0; x < w; x += dw) {
        const subsection = this.#subsections.findLast((ss) => ss.start <= bar)
        const colour = subsection?.colour ?? style.backgroundColor

        g(colour, x, x + dw)

        bar++
      }
    } else if (w > 0) {
      let x = 0

      const subsections = this.#subsections.filter((ss) => ss.start < this.head)
      for (const subsection of subsections) {
        const colour = subsection.colour ?? style.backgroundColor
        const bar = Math.min(this.head, subsection.end)
        const xʼ = bar * dw

        g(colour, x, xʼ)

        x = xʼ
      }

      if (x < w) {
        g(style.backgroundColor, x, w)
      }
    }
  }
}

function faded(colour, alpha) {
  // rgb(..)
  {
    const match = colour.match(/^rgb\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+).*/)

    if (match) {
      const [_, r, g, b] = match

      return `rgb(${r}, ${g}, ${b}, ${alpha})`
    }
  }

  // rgba(..)
  {
    const match = colour.match(/^rgba\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+).*/)

    if (match) {
      const [_, r, g, b] = match

      return `rgb(${r}, ${g}, ${b}, ${alpha})`
    }
  }

  // #xxxxxx
  {
    const match = colour.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/)

    if (match) {
      const r = parseInt(match[1], 16)
      const g = parseInt(match[2], 16)
      const b = parseInt(match[3], 16)

      return `rgb(${r}, ${g}, ${b}, ${alpha})`
    }
  }

  return 'rgba(255,255,255,0)'
}

customElements.define('yam-progress', ProgressBar)
