import { EVENTS, INF } from '../constants.js'
import * as generators from '../generators.js'

export class Editor extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #track = null
  #expanded = false

  #handlers = {
    mm: {
      change: (event) => {
        if (event.detail.pulse) {
          event.target.pulse = event.detail.pulse
        }

        if (event.detail.BPM) {
          event.target.BPM = event.detail.BPM
        }
      },
    },

    save: {
      click: (_event) => {
        this.#save()
      },
    },

    sections: {
      click: (_event) => {
        this.#toggle()
      },
    },

    plus: {
      click: (_event) => {
        this.#add()
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-editor')
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
    this.classList.add('component-editor')

    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const save = container.querySelector('#save')
    const mm = container.querySelector('yam-mm')
    const sections = shadow.querySelector('div.sections div.header')
    const plus = container.querySelector('div.sections #plus')

    save.addEventListener('click', this.#handlers.save.click)
    mm.addEventListener('change', this.#handlers.mm.change)
    sections.addEventListener('click', this.#handlers.sections.click)
    plus.addEventListener('click', this.#handlers.plus.click)
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
    const loops = container.querySelector('#loops')
    const BPM = container.querySelector('#BPM')
    const sections = container.querySelector('div.sections')
    const ul = sections.querySelector('ul')
    const plus = container.querySelector('div.sections #plus')

    title.value = track?.title ?? ''
    save.disabled = track == null

    timeSignature.disabled = track == null
    timeSignature.timeSignature = track?.timeSignature ?? '4:4'

    mm.disabled = track == null
    mm.pulse = track?.pulse ?? 'quarter'
    mm.BPM = track?.tempo ?? 120

    BPM.value = track?.BPM ?? track?.tempo ?? 120
    BPM.disabled = track == null

    loop.enabled = track?.loopable ?? false
    loop.loop = track?.loop ?? false

    loops.disabled = track == null
    loops.value = [2, 3, 4, 5].includes(track?.loops) ? track.loops : -`1`

    plus.disabled = track == null

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
        // section.removeAttribute('expanded','')

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

  #save() {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const title = container.querySelector('input#title')
    const timeSignature = container.querySelector('yam-time-signature')
    const mm = container.querySelector('yam-mm')
    const bpm = container.querySelector('#BPM')
    const loop = container.querySelector('yam-loop')
    const loops = container.querySelector('#loops')
    const sections = Array.from(container.querySelector('div.sections ul').querySelectorAll('yam-section')).map((v) => {
      return {
        name: v.name,
        role: v.role,
        measures: v.measures,
        tempo: v.tempo,
      }
    })

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
          loops: ['2', '3', '4', '5'].includes(loops.value) ? Number.parseInt(loops.value) : INF,
          sections: [...sections],
        },
      }),
    )
  }

  #add() {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const sections = container.querySelector('div.sections details')
    const ul = sections.querySelector('ul')
    const li = document.createElement('li')
    const section = document.createElement('yam-section')

    section.section = {
      name: '',
      role: '',
      measures: INF,
    }

    li.setAttribute('draggable', false)
    li.appendChild(section)

    ul.appendChild(li)
  }

  #toggle() {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const sections = Array.from(container.querySelector('div.sections ul').querySelectorAll('yam-section'))

    this.#expanded = !this.#expanded

    if (this.#expanded) {
      sections.forEach((v) => v.setAttribute('expanded', ''))
    } else {
      sections.forEach((v) => v.removeAttribute('expanded'))
    }
  }
}

function* transmogrify(track) {
  const sections = track?.sections ?? []
  const _roles = generators.roles()
  const _names = generators.names()

  let tempo = track?.BPM ?? 120
  let timeSignature = track?.timeSignature ?? '4:4'
  let pulse = track?.pulse ?? ''
  // let measures = 0

  for (const section of sections) {
    const _subsections = section.subsections ?? []

    timeSignature = section.timeSignature ?? timeSignature
    pulse = section.pulse ?? pulse

    const role = _roles(section.role)
    const name = _names(null, role)
    let bars = 0

    const clicks = section.clicks ?? null
    const subsections = []

    if (_subsections.length == 0) {
      // subsections.push({
      //   measures:
      //   tempo: tempo,
      //   timeSignature: timeSignature,
      //   pulse: pulse,
      //   clicks: clicks,
      // })

      bars = section.measures ?? (['count-in', 'anacrusis'].includes(role) ? 1 : Number.POSITIVE_INFINITY)
    } else {
      for (const subsection of _subsections) {
        tempo = subsection.tempo ?? tempo
        timeSignature = subsection.timeSignature ?? timeSignature
        pulse = subsection.pulse ?? pulse

        subsections.push({
          measures: subsection.measures ?? Number.POSITIVE_INFINITY,
          timeSignature: timeSignature,
          pulse: pulse,
          clicks: subsection.clicks ?? clicks,
        })
      }

      bars = section.measures ?? (['count-in', 'anacrusis'].includes(role) ? 1 : Number.POSITIVE_INFINITY)
    }

    yield {
      role: {
        track: section.role,
        generated: role,
      },

      name: {
        track: section.name,
        generated: name,
      },

      tempo: section.tempo,
      subsections: subsections,
      measures: bars,
    }

    // measures += bars
  }
}

customElements.define('yam-editor', Editor)
