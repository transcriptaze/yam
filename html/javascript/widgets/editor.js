import { EVENTS, INF } from '../constants.js'
import * as generators from '../generators.js'
import { parseTimeSignature } from '../util.js'

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
    timeSignature: {
      change: (event) => {
        const defaults = {}

        if (event.detail.timeSignature) {
          defaults.timeSignature = event.detail.timeSignature
        }

        this.#defaults = defaults
        this.#modified = true
      },
    },

    mm: {
      changed: (event) => {
        const defaults = {}

        if (event.detail.pulse) {
          event.target.pulse = event.detail.pulse
          defaults.pulse = event.detail.pulse
        }

        if (event.detail.BPM) {
          event.target.BPM = event.detail.BPM
          defaults.BPM = event.detail.BPM
        }

        this.#defaults = defaults
        this.#modified = true
      },
    },

    BPM: {
      change: () => {
        const BPM = Number.parseInt(this.#BPM.value)

        if (!Number.isNaN(BPM) && BPM >= 40 && BPM <= 200) {
          this.#modified = true
          this.#defaults = {}
        }
      },

      changed: () => {
        const BPM = Number.parseInt(this.#BPM.value)

        if (!Number.isNaN(BPM) && BPM >= 40 && BPM <= 200) {
          this.#modified = true
          this.#defaults = {}
        }
      },
    },

    loop: {
      change: () => {
        this.#modified = true
      },
    },

    loops: {
      change: () => {
        this.#modified = true
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

      expand: () => {
        const ul = this.#sections.querySelector('ul')
        const sections = Array.from(ul.querySelectorAll('yam-section'))
        const expanded = sections.every((v) => v.getAttribute('expanded') != null)
        const collapsed = sections.every((v) => v.getAttribute('expanded') == null)

        if (this.#expanded && collapsed) {
          this.#toggle()
        } else if (!this.#expanded && expanded) {
          this.#toggle()
        }
      },

      change: (event) => {
        event.preventDefault()
        event.stopPropagation()

        // FIXME time-signature && mm should be an async getters
        const defaults = {}

        if (event.detail.timeSignature != null) {
          defaults.timeSignature = this.#fields.timeSignature?.timeSignature
        }

        if (event.detail.pulse != null) {
          defaults.pulse = this.#fields.mm?.pulse
        }

        if (event.detail.BPM != null) {
          defaults.BPM = this.#fields.mm?.BPM
        }

        this.#defaults = defaults
        this.#modified = true
      },

      changed: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.#modified = true
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

    this.#timeSignature.addEventListener('change', this.#handlers.timeSignature.change)
    this.#mm.addEventListener('change', this.#handlers.mm.changed)
    this.#plus.addEventListener('click', this.#handlers.plus.click)

    this.#fields.BPM.addEventListener('input', this.#handlers.BPM.change)
    this.#fields.BPM.addEventListener('change', this.#handlers.BPM.changed)
    this.#fields.loop.addEventListener('change', this.#handlers.loop.change)
    this.#fields.loops.addEventListener('change', this.#handlers.loops.change)

    this.#sections.addEventListener(EVENTS.SECTION_TIME_SIGNATURE_CHANGE, this.#handlers.sections.change)
    this.#sections.addEventListener(EVENTS.SECTION_PULSE_CHANGE, this.#handlers.sections.change)
    this.#sections.addEventListener(EVENTS.SECTION_BPM_CHANGE, this.#handlers.sections.change)
    this.#sections.addEventListener(EVENTS.SECTION_MEASURES_CHANGE, this.#handlers.sections.changed)
    this.#sections.addEventListener(EVENTS.SECTION_CHANGED, this.#handlers.sections.changed)
    this.#sections.addEventListener(EVENTS.SECTION_EXPAND, this.#handlers.sections.expand)
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

    save.disabled = true

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

      ul.style.opacity = 0
      ul.replaceChildren(...children)
      ul.style.opacity = 1

      requestAnimationFrame(() => {
        children.forEach((li) => li.classList.add('show'))
      })
    }

    this.#track = track
    this.#defaults = {}
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
      const subsection = (ss) => {
        const object = {
          measures: ss.measures,
        }

        if (ss.timeSignature != null && ss.timeSignature != '') {
          object.timeSignature = ss.timeSignature
        }

        if (ss.tempo.pulse != null && ss.tempo.pulse != '') {
          object.pulse = ss.tempo.pulse
        }

        if (ss.tempo.BPM != null && ss.tempo.BPM != '') {
          object.tempo = ss.tempo.BPM
        }

        return object
      }

      return {
        name: v.name,
        role: v.role,
        measures: v.measures,
        timeSignature: v.timeSignature,
        pulse: v.tempo?.pulse,
        tempo: v.tempo?.BPM,
        subsections: v.subsections.map((ss) => subsection(ss)),
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
    // ... add and initialise new section
    const ul = this.#sections.querySelector('ul')
    const li = document.createElement('li')
    const section = document.createElement('yam-section')

    section.section = {
      name: '',
      role: '',
      measures: INF,
      subsections: [
        {
          measures: null,
          timeSignature: null,
          tempo: {
            pulse: null,
            BPM: null,
          },
          defaults: {
            timeSignature: '4:4',
            pulse: 'quarter',
            BPM: 120,
          },
        },
      ],
    }

    li.setAttribute('draggable', false)
    li.classList.add('show')
    li.appendChild(section)

    ul.appendChild(li)

    // ... set default values
    this.#defaults = {}

    section.setAttribute('expanded', '')
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

  // ... "cascade" updates section/subsection defaults values
  set #defaults(object) {
    const sections = Array.from(this.#sections?.querySelectorAll('yam-section'))
    const it = sections.values()

    const track = {
      tempo: this.#mm.BPM,
      BPM: Number.parseInt(this.#BPM.value),
    }

    let timeSignature = object?.timeSignature ?? this.#timeSignature.timeSignature
    let pulse = object?.pulse ?? this.#mm.pulse
    let BPM = object?.BPM ?? this.#mm.BPM

    for (const section of it) {
      const subsections = section.subsections

      for (const subsection of subsections) {
        subsection.track = track

        subsection.defaults = {
          timeSignature: timeSignature,
          pulse: pulse,
          BPM: BPM,
        }

        const { beats, divisions } = parseTimeSignature(`${subsection.timeSignature}`)
        const tempo = subsection.tempo

        if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
          timeSignature = subsection.timeSignature
        }

        if (tempo.pulse != null && tempo.pulse !== '') {
          pulse = tempo.pulse
        }

        if (tempo.BPM != null && tempo.BPM >= 40 && tempo.BPM < 200) {
          BPM = tempo.BPM
        }
      }
    }
  }

  set #modified(v) {
    if (v === true) {
      const container = this.shadowRoot.querySelector('div.track-editor')
      const save = container.querySelector('#save')

      save.disabled = this.#track == null
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
      timeSignature: timeSignature,
      pulse: pulse,
      tempo: tempo,
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
        defaults.timeSignature = subsection.timeSignature ?? defaults.timeSignature
        defaults.pulse = subsection.pulse ?? pulse
        defaults.tempo = subsection.tempo ?? tempo

        timeSignature = subsection.timeSignature ?? timeSignature
        pulse = subsection.pulse ?? pulse
        tempo = subsection.tempo ?? tempo

        subsections.push({
          timeSignature: subsection.timeSignature,

          tempo: {
            pulse: subsection.pulse,
            BPM: subsection.tempo,
          },

          measures: subsection.measures ?? Number.POSITIVE_INFINITY,

          defaults: {
            timeSignature: defaults.timeSignature,
            pulse: defaults.pulse,
            BPM: defaults.tempo,
          },
        })

        bars += subsection.measures ?? Number.POSITIVE_INFINITY
      }
    } else {
      subsections.push({
        timeSignature: section.timeSignature,

        tempo: {
          pulse: section.pulse,
          BPM: section.tempo,
        },

        measures: section.measures ?? (['count-in', 'anacrusis'].includes(role) ? 1 : Number.POSITIVE_INFINITY),

        defaults: {
          timeSignature: defaults.timeSignature,
          pulse: defaults.pulse,
          BPM: defaults.tempo,
        },
      })
    }

    yield {
      name: {
        track: section.name,
        generated: name,
      },

      role: {
        track: section.role,
        generated: role,
      },

      timeSignature: section.timeSignature,

      tempo: {
        pulse: section.pulse,
        BPM: section.tempo,
      },

      subsections: subsections,
      measures: bars,

      defaults: {
        timeSignature: defaults.timeSignature,
        pulse: defaults.pulse,
        BPM: defaults.tempo,
      },
    }
  }
}

customElements.define('yam-editor', Editor)
