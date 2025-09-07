import { EVENTS } from '../constants.js'
import * as generators from '../generators.js'

export class Editor extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #track = null

  constructor() {
    super()

    const template = document.querySelector('#template-editor')
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
    this.classList.add('component-editor')

    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const save = container.querySelector('#save')
    const mm = container.querySelector('yam-mm')

    save.addEventListener('click', this.#handlers.save.click)
    mm.addEventListener('change', this.#handlers.mm.change)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set track(track) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const title = container.querySelector('input#title')
    const save = container.querySelector('#save')
    const timeSignature = container.querySelector('yam-time-signature')
    const mm = container.querySelector('yam-mm')
    const loop = container.querySelector('yam-loop')
    const BPM = container.querySelector('#BPM')
    const sections = container.querySelector('div.sections details')
    const ul = sections.querySelector('ul')

    title.value = track?.title ?? ''
    save.disabled = track == null

    timeSignature.disabled = track == null
    timeSignature.timeSignature = track?.timeSignature ?? '4:4'

    mm.disabled = track == null
    mm.pulse = track?.pulse ?? 'quarter'
    mm.BPM = track?.tempo ?? 120

    loop.enabled = track?.loopable ?? false
    loop.loop = track?.loop ?? false

    BPM.value = track?.BPM ?? track?.tempo ?? 120
    BPM.disabled = track == null

    if (track == null) {
      sections.classList.add('disabled')
      sections.removeAttribute('open')
      ul.replaceChildren()
    } else {
      sections.classList.remove('disabled')
      sections.setAttribute('open', '')

      const children = []

      ;[...transmogrify(track)].forEach((v) => {
        const li = document.createElement('li')
        const section = document.createElement('yam-section')

        section.section = v

        li.setAttribute('draggable', false)
        li.appendChild(section)

        children.push(li)
      })

      ul.replaceChildren(...children)
    }

    this.#track = track
  }

  update(track) {
    if (this.#track != null && this.#track.UUID === track?.UUID) {
      this.track = track
    }
  }

  #handlers = {
    mm: {
      change: (e) => {
        if (e.detail.pulse) {
          e.target.pulse = e.detail.pulse
        }

        if (e.detail.BPM) {
          e.target.BPM = e.detail.BPM
        }
      },
    },

    save: {
      click: (_event) => {
        const shadow = this.shadowRoot
        const container = shadow.querySelector('div.track-editor')
        const title = container.querySelector('input#title')
        const timeSignature = container.querySelector('yam-time-signature')
        const mm = container.querySelector('yam-mm')
        const loop = container.querySelector('yam-loop')
        const bpm = container.querySelector('input#BPM')

        const BPM = Number.parseInt(bpm.value)

        this.dispatchEvent(
          new CustomEvent(EVENTS.EDIT_SAVE, {
            bubbles: true,
            composed: true,
            detail: {
              track: this.#track?.UUID,
              title: title.value,
              timeSignature: timeSignature.timeSignature,
              pulse: mm.pulse,
              tempo: mm.BPM,
              BPM: !Number.isNaN(BPM) && BPM >= 40 && BPM <= 200 ? BPM : null,
              loop: loop.loop,
            },
          }),
        )
      },
    },
  }
}

// function transmogrify(track) {
//   return [...generators.transmogrify(track)].map((v) => {
//     return v
//     // {
//     //   ID: v.ID,
//     //   role: v.role,
//     //   name: v.name,
//     //   measures: v.measures,
//     //   colour: v.colour,
//     //   start: v.start,
//     // }
//   })
// }

function* transmogrify(track) {
  const sections = track?.sections ?? []
  const _roles = generators.roles()
  const _names = generators.names()
  // const _colours = generators.colours()

  // let ID = 0
  let tempo = track?.BPM ?? 120
  let timeSignature = track?.timeSignature ?? '4:4'
  let pulse = track?.pulse ?? ''
  // let measures = 0

  for (const section of sections) {
    const _subsections = section.subsections ?? []

    // ID++
    tempo = section.tempo ?? tempo
    timeSignature = section.timeSignature ?? timeSignature
    pulse = section.pulse ?? pulse

    const role = _roles(section.role)
    const name = _names(null, role)
    // const colour = _colours(section.colour, role)

    const clicks = section.clicks ?? null
    const subsections = []

    if (_subsections.length == 0) {
      subsections.push({
        measures: section.measures ?? (['count-in', 'anacrusis'].includes(role) ? 1 : Number.POSITIVE_INFINITY),
        tempo: tempo,
        timeSignature: timeSignature,
        pulse: pulse,
        clicks: clicks,
      })
    } else {
      for (const subsection of _subsections) {
        tempo = subsection.tempo ?? tempo
        timeSignature = subsection.timeSignature ?? timeSignature
        pulse = subsection.pulse ?? pulse

        subsections.push({
          measures: subsection.measures ?? Number.POSITIVE_INFINITY,
          tempo: tempo,
          timeSignature: timeSignature,
          pulse: pulse,
          clicks: subsection.clicks ?? clicks,
        })
      }
    }

    const bars = subsections.reduce((measures, v) => measures + v.measures, 0)

    yield {
      // ID: ID,
      role: {
        track: section.role,
        generated: role,
      },

      name: {
        track: section.name,
        generated: name,
      },
      // colour: colour,
      // subsections: subsections,
      measures: bars,
    }

    // measures += bars
  }
}

customElements.define('yam-editor', Editor)
