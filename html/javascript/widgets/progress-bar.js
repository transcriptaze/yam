import { INF } from '../constants.js'

export class ProgressBar extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #bars = Number.POSITIVE_INFINITY
  #head = 0
  #subsections = [
    // {
    //   start: 0,
    //   end: 4,
    //   colour: '#ff0000',
    // },
    // {
    //   start: 4,
    //   end: 8,
    //   // colour: '#00ff00',
    // },
    // {
    //   start: 8,
    //   end: 12,
    //   colour: '#0000ff',
    // },
  ]

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

  set head(v) {
    if (!Number.isNaN(v) && v !== this.#head) {
      this.#head = Math.max(0, v)
      this.redraw()
    }
  }

  get bars() {
    return this.#bars
  }

  set bars(v) {
    const bars = Number.isNaN(v) || v === INF ? 0 : v

    if (bars !== this.#bars) {
      this.#bars = Math.max(0, bars)
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

    const width = canvas.width
    const height = canvas.height
    const w = this.bars > 0 ? (width * this.head) / this.bars : 0
    const dw = this.bars > 0 ? width / this.bars : 0

    ctx.clearRect(0, 0, width, height)

    // ... gradient function
    const g = (colour, x, xʼ) => {
      const startColour = faded(colour, 0)
      const gradient = ctx.createLinearGradient(x, 0, xʼ, height)

      gradient.addColorStop(0, colour)
      gradient.addColorStop(0.05, startColour)
      gradient.addColorStop(1, colour)

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.rect(x, 0, xʼ - x, height)
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

      // FIXME use gradient function
      if (x < w) {
        const colour = style.backgroundColor
        const startColour = faded(colour, 0)
        const gradient = ctx.createLinearGradient(x, 0, w, height)
        const stop = this.head > 0 ? Math.max(0, this.head - 1) / this.bars : 0

        gradient.addColorStop(0, colour)
        gradient.addColorStop(0.05, startColour)
        gradient.addColorStop(1, colour)

        // NTS: stop can be (mistakenly and/or temporarily) greater than 1 because value and bars are set independently
        if (stop > 0) {
          gradient.addColorStop(Math.min(1, stop), colour)
        }

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.rect(x, 0, w, height)
        ctx.fill()
      }
    }
  }
}

function faded(colour, alpha) {
  const match = colour.match(/\(([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)/)

  if (!match) {
    return 'rgba(255,255,255,0)'
  } else {
    const [_, r, g, b] = match

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
}

customElements.define('yam-progress', ProgressBar)
