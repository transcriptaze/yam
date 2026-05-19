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

// const BACKGROUNDS = ['#e4e4e4', '#ececec']

export class BarGraph extends HTMLElement {
  static get observedAttributes() {
    return ['background', 'labels']
  }

  #played = []
  #style = {
    labels: '',
    background: null,
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
      const columns = [1 * dw]

      this.#played.slice(1).reduce((a, record) => {
        a += 2
        if (this.#played.length > 7 && record.date.getDay() === 1) {
          a += 1
        }

        columns.push(a * dw)

        return a
      }, 1)

      // console.log(this.#played.length, { N }, { gaps }, { dw }, { cw })
      // console.log(columns)
      // console.log(this.#style)

      // // ... month backgrounds
      // const backgrounds = new Map()
      // if (this.#style.background === 'months') {
      //   const months = this.#played.reduce((set, v) => set.add(v.date.getMonth()), new Set())
      //   let ix = 0
      //
      //   months.forEach((v) => {
      //     backgrounds.set(v, BACKGROUNDS[ix % BACKGROUNDS.length])
      //     ix++
      //   })
      // }

      // ... bars
      const max = this.#played.reduce((a, v) => (v.played > a ? v.played : a), 0)

      this.#played.forEach((record, ix) => {
        const x = columns[ix]
        const h = 0.9 * Math.ceil((height * record.played) / max)

        ctx.fillStyle = COLOURS[ix % COLOURS.length]
        ctx.fillRect(Math.ceil(x - cw / 2), height - h - 2, cw, h)
      })

      // ... weekdays labels
      if (this.#style.labels === 'weekdays') {
        const days = this.#played.map((v) => WEEKDAYS[v.date.getDay()])

        days.forEach((day, ix) => {
          const x = columns[ix]

          ctx.font = '20px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#000000'
          ctx.fillText(day, x, height - 2)
        })
      }

      if (this.#style.labels === 'weekdays-small') {
        const days = this.#played.map((v) => WEEKDAYS[v.date.getDay()])

        days.forEach((day, ix) => {
          const x = columns[ix]

          ctx.font = '16px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = '#000000'
          ctx.fillText(day, x, height - 2)
        })
      }
    }
  }
}

customElements.define('yam-bar-graph', BarGraph)
