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

    if (canvas.width != canvas.clientWidth) {
      canvas.width = canvas.clientWidth
    }

    if (canvas.height != canvas.clientHeight) {
      canvas.height = canvas.clientHeight
    }

    const width = canvas.width
    const height = canvas.height
    const dw = width / 7
    const colours = [
      '#6B8E8D', // muted teal
      '#A3B18A', // soft sage green
      '#D4A5A5', // dusty rose
      '#8FAADC', // gentle blue
      '#E6C79C', // warm sand
      '#BFA2DB', // light lavender
      '#F2B5A7', // soft coral
    ]

    const max = 1.2 * this.#played.reduce((a, v) => (v.played > a ? v.played : a), 0)

    ctx.clearRect(0, 0, width, height)

    let x = 0
    let ix = 0
    while (x < width) {
      const record = ix < this.#played.length ? this.#played[ix] : { date: null, played: 0 }
      const h = Math.ceil((height * record.played) / max)

      ctx.fillStyle = colours[ix % colours.length]
      ctx.fillRect(Math.floor(x + 6), height - h, Math.ceil(dw - 12), height)

      x += dw
      ix += 1
    }
  }
}

customElements.define('yam-bar-graph', BarGraph)
