import { EVENTS, INF } from '../constants.js'
import * as generators from '../generators.js'

export class Editor extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  // ... fields
  #fields = {}

  // ... state
  #track = null
  #expanded = false

  // ... handlers
  #handlers = {
    mm: {
      change: (event) => {
        if (event.detail.pulse) {
          event.target.pulse = event.detail.pulse

          this.#defaults = {
            pulse: event.detail.pulse,
          }
        }

        if (event.detail.BPM) {
          event.target.BPM = event.detail.BPM
        }
      },
    },

    save: {
      click: () => {
        this.#save()
      },
    },

    sections: {
      click: () => {
        this.#toggle()
      },

      change: (event) => {
        event.preventDefault()
        event.stopPropagation()

        // FIXME this.#fields.mm needs to be async getter
        this.#defaults = {
          pulse: this.#fields.mm?.pulse ?? 'quarter',
        }
      },
    },

    plus: {
      click: () => {
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

    const container = shadow.querySelector('div.track-editor')

    this.#fields = {
      title: container.querySelector('input#title'),
      timeSignature: container.querySelector('yam-time-signature'),
      mm: container.querySelector('yam-mm'),
      BPM: container.querySelector('#BPM'),
      loop: container.querySelector('yam-loop'),
      loops: container.querySelector('#loops'),
      sections: container.querySelector('div.sections'),
      plus: container.querySelector('div.sections #plus'),
    }

    if (Object.values(this.#fields).some((e) => e == null)) {
      throw new Error('missing fields')
    }
  }

  connectedCallback() {
    this.classList.add('component-editor')

    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const save = container.querySelector('#save')
    const toggle = this.#sections.querySelector('div.header')

    save.addEventListener('click', this.#handlers.save.click)
    toggle.addEventListener('click', this.#handlers.sections.click)

    this.#mm.addEventListener('change', this.#handlers.mm.change)
    this.#plus.addEventListener('click', this.#handlers.plus.click)
    this.#sections.addEventListener(EVENTS.SECTION_PULSE_CHANGE, this.#handlers.sections.change)

    // this.#sections.addEventListener(EVENTS.SECTION_PULSE_CHANGE, (e) => {
    //   e.preventDefault()
    //   e.stopPropagation()

    //   const sections = Array.from(this.#sections?.querySelectorAll('yam-section'))
    //   const it = sections.values()

    //   let pulse = this.#fields.mm?.pulse ?? 'quarter'
    //   for (const section of it) {
    //     const tempo = section.tempo

    //     section.defaults = {
    //       pulse: pulse,
    //     }

    //     if (tempo.pulse != null && tempo.pulse !== '') {
    //       pulse = tempo.pulse
    //     }
    //   }
    // })
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set track(track) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.track-editor')
    const save = container.querySelector('#save')
    const ul = this.#sections.querySelector('ul')
    const icon = this.#sections.querySelector('div.header img')

    save.disabled = track == null

    this.#title.value = track?.title ?? ''

    this.#timeSignature.disabled = track == null
    this.#timeSignature.timeSignature = track?.timeSignature ?? '4:4'

    this.#mm.disabled = track == null
    this.#mm.pulse = track?.pulse ?? 'quarter'
    this.#mm.BPM = track?.tempo ?? 120

    this.#BPM.value = track?.BPM ?? track?.tempo ?? 120
    this.#BPM.disabled = track == null

    this.#loop.enabled = track?.loopable ?? false
    this.#loop.loop = track?.loop ?? false

    this.#loops.disabled = track == null
    this.#loops.value = [2, 3, 4, 5].includes(track?.loops) ? track.loops : -`1`

    this.#plus.disabled = track == null

    if (track == null) {
      this.#sections.classList.add('disabled')
      this.#sections.removeAttribute('open')
      this.#expanded = false

      icon.classList.remove('expanded')
      ul.replaceChildren()
    } else {
      this.#sections.classList.remove('disabled')
      this.#sections.setAttribute('open', '')
      this.#expanded = false

      const children = []

      ;[...transmogrify(track)].forEach((v) => {
        const li = document.createElement('li')
        const section = document.createElement('yam-section')

        section.section = v

        li.setAttribute('draggable', false)
        li.appendChild(section)

        children.push(li)
      })

      icon.classList.remove('expanded')
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
    const title = this.#title.value
    const timeSignature = this.#timeSignature.timeSignature
    const pulse = this.#mm.pulse
    const tempo = this.#mm.BPM
    const BPM = Number.parseInt(this.#BPM.value)
    const loop = this.#loop.loop
    const loops = this.#loops.value
    const ul = this.#sections.querySelector('ul')

    const sections = Array.from(ul.querySelectorAll('yam-section')).map((v) => {
      return {
        name: v.name,
        role: v.role,
        measures: v.measures,
        timeSignature: v.timeSignature,
        pulse: v.tempo.pulse,
        tempo: v.tempo.BPM,
      }
    })

    this.dispatchEvent(
      new CustomEvent(EVENTS.EDIT_SAVE, {
        bubbles: true,
        composed: true,
        detail: {
          track: this.#track?.UUID,
          title: title,
          timeSignature: timeSignature,
          pulse: pulse,
          tempo: tempo,
          BPM: !Number.isNaN(BPM) && BPM >= 40 && BPM <= 200 ? BPM : null,
          loop: loop,
          loops: ['2', '3', '4', '5'].includes(loops) ? Number.parseInt(loops) : INF,
          sections: [...sections],
        },
      }),
    )
  }

  #add() {
    const ul = this.#sections.querySelector('ul')
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
    const icon = this.#sections.querySelector('div.header img')
    const ul = this.#sections.querySelector('ul')
    const sections = Array.from(ul.querySelectorAll('yam-section'))

    this.#expanded = !this.#expanded

    if (this.#expanded) {
      icon.classList.add('expanded')
      sections.forEach((v) => v.setAttribute('expanded', ''))
    } else {
      icon.classList.remove('expanded')
      sections.forEach((v) => v.removeAttribute('expanded'))
    }
  }

  get #title() {
    return this.#fields.title
  }

  get #timeSignature() {
    return this.#fields.timeSignature
  }

  get #mm() {
    return this.#fields.mm
  }

  get #BPM() {
    return this.#fields.BPM
  }

  get #loop() {
    return this.#fields.loop
  }

  get #loops() {
    return this.#fields.loops
  }

  get #sections() {
    return this.#fields.sections
  }

  get #plus() {
    return this.#fields.plus
  }

  // ... "cascade" updates section defaults values
  set #defaults(object) {
    const sections = Array.from(this.#sections?.querySelectorAll('yam-section'))
    const it = sections.values()
    let pulse = object?.pulse ?? ''

    if (pulse !== '') {
      for (const section of it) {
        const tempo = section.tempo

        section.defaults = {
          pulse: pulse,
        }

        if (tempo.pulse != null && tempo.pulse !== '') {
          pulse = tempo.pulse
        }
      }
    }
  }
}

function* transmogrify(track) {
  const sections = track?.sections ?? []
  const _roles = generators.roles()
  const _names = generators.names()

  let timeSignature = track?.timeSignature ?? '4:4'
  let pulse = track?.pulse ?? ''
  let tempo = track?.tempo ?? ''

  for (const section of sections) {
    const _subsections = section.subsections ?? []

    const defaults = {
      pulse: pulse,
    }

    timeSignature = section.timeSignature ?? timeSignature
    pulse = section.pulse ?? pulse
    tempo = section.tempo ?? tempo

    const role = _roles(section.role)
    const name = _names(null, role)
    const subsections = []
    let bars = section.measures ?? (['count-in', 'anacrusis'].includes(role) ? 1 : Number.POSITIVE_INFINITY)

    if (_subsections.length > 0) {
      bars = 0

      for (const subsection of _subsections) {
        subsections.push({
          measures: subsection.measures ?? Number.POSITIVE_INFINITY,
        })

        bars += subsection.measures ?? Number.POSITIVE_INFINITY
      }
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

      timeSignature: section.timeSignature,

      tempo: {
        pulse: section.pulse,
        BPM: section.tempo,

        defaults: {
          pulse: defaults.pulse,
          BPM: tempo,
        },
      },

      subsections: subsections,
      measures: bars,
    }
  }
}

customElements.define('yam-editor', Editor)
