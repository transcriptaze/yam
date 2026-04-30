export class BarGraph extends HTMLElement {
  static get observedAttributes() {
    return []
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

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.redraw()
      }
    })

    this.resizeObserver.observe(this)
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect()
  }

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  redraw() {
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
    const dw = Math.ceil(width / 7)

    console.log('redraw', width, height, canvas.clientWidth, dw)

    ctx.clearRect(0, 0, width, height)

    let x = 0
    while (x < width) {
      ctx.fillStyle = '#ff0000ff'
      ctx.fillRect(x, 0, dw, height)
      x += dw

      ctx.fillStyle = '#00ff00ff'
      ctx.fillRect(x, 0, dw, height)
      x += dw
    }
  }
}

customElements.define('yam-bar-graph', BarGraph)
