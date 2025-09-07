import { INF } from '../constants.js'

export class ProgressBar extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #max = Number.POSITIVE_INFINITY
  #value = 0

  constructor() {
    super()

    const template = document.querySelector('#template-progress-bar')
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
    this.classList.add('component-progress-bar')
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  get value() {
    return this.#value
  }

  set value(v) {
    if (!Number.isNaN(v) && v !== this.#value) {
      this.#value = Math.max(0, v)
      this.redraw()
    }
  }

  get max() {
    return this.#max
  }

  set max(v) {
    const max = Number.isNaN(v) || v === INF ? 0 : v

    if (max !== this.#max) {
      this.#max = Math.max(0, max)
      this.redraw()
    }
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
    const w = this.max > 0 ? (width * this.value) / this.max : 0
    const dw = this.max > 0 ? width / this.max : 0
    const colour = style.backgroundColor
    const startColour = faded(colour, 0)

    ctx.clearRect(0, 0, width, height)

    if (w > 0 && dw > 25) {
      for (let x = 0; x < w; x += dw) {
        const gradient = ctx.createLinearGradient(x, 0, x + dw, height)

        gradient.addColorStop(0, colour)
        gradient.addColorStop(0.05, startColour)
        gradient.addColorStop(1, colour)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.rect(x, 0, dw, height)
        ctx.fill()
      }
    } else if (w > 0) {
      const gradient = ctx.createLinearGradient(0, 0, w, height)
      const stop = this.value > 0 ? Math.max(0, this.value - 1) / this.max : 0

      gradient.addColorStop(0, colour)
      gradient.addColorStop(0.05, startColour)
      gradient.addColorStop(1, colour)

      // NTS: stop can be (mistakenly and/or temporarily) greater than 1 because value and max are set independently
      if (stop > 0) {
        gradient.addColorStop(Math.min(1, stop), colour)
      }

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.rect(0, 0, w, height)
      ctx.fill()
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
