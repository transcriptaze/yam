import * as DB from '../db.js'
import { warnf } from '../log.js'
import * as generators from '../generators.js'
import { PULSES, INF } from '../constants.js'
import { parseTimeSignature, parsePulse } from '../util.js'

const LOGTAG = 'track'
const VERSION = 0
const RETENTION = 30 // days

export function create(UUID) {
  const track = new Track({
    UUID: UUID ?? '',
  })

  return track
}

export class Track extends EventTarget {
  #version = VERSION
  #deleted = null
  #modified = false

  #title = ''
  #tempo = 120
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #sections = []
  #metronome = {
    BPM: 120,
    loop: false,
    loops: INF,
  }

  static clone(track) {
    return new Track({
      UUID: '',
      title: '',
      tempo: track.tempo,
      timeSignature: track.timeSignature,
      pulse: track.pulse ?? 'quarter',
      sections: [...track.sections],
      metronome: {
        BPM: track.BPM,
        loop: track.loop ?? false,
        loops: track.loops ?? INF,
        clicks: track.clicks,
        dings: track.dings,
      },
    })
  }

  constructor(object) {
    super()

    this.UUID = object.UUID ?? ''
    this.#version = VERSION
    this.#deleted = object.deleted ?? null

    this.#title = `${object.title ?? ''}`.trim()
    this.#tempo = object.tempo ?? 120
    this.#timeSignature = object.timeSignature ?? '4:4'
    this.#pulse = object.pulse ?? 'quarter'
    this.#sections = object.sections ?? []
    this.#metronome = {
      BPM: object.metronome?.BPM ?? 120,
      loop: object.metronome?.loop ?? false,
      loops: object.metronome?.loops ?? INF,
      clicks: object?.metronome?.clicks ?? null,
      dings: object?.metronome?.dings ?? null,
    }
  }

  get object() {
    const object = {
      UUID: this.UUID,
      version: this.#version,
      deleted: this.#deleted,

      title: this.title,
      tempo: this.tempo,
      timeSignature: this.timeSignature,
      pulse: this.pulse,
      sections: [...this.sections],

      metronome: {
        BPM: this.BPM,
        loop: this.loop,
        loops: this.loops,
      },
    }

    if (this.clicks != null) {
      object.metronome.clicks = this.clicks
    }

    if (this.dings != null) {
      object.metronome.dings = this.dings
    }

    return object
  }

  get modified() {
    return this.#modified
  }

  get deleted() {
    return this.#deleted != null
  }

  get title() {
    return this.#title
  }

  set title(v) {
    if (v != null) {
      this.#title = `${v}`.trim()
    }
  }

  get tempo() {
    return this.#tempo
  }

  get timeSignature() {
    return this.#timeSignature
  }

  set timeSignature(v) {
    const notify = () => {
      this.#modified = this.title != ''
      this.dispatchEvent(new Event('modified'))
    }

    if (`${v}` === 'common') {
      this.#timeSignature = `common`
      notify()
    } else if (`${v}` === 'cut') {
      this.#timeSignature = `cut`
      notify()
    } else {
      const { beats, divisions } = parseTimeSignature(`${v}`)

      if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
        this.#timeSignature = `${beats}:${divisions}`
        notify()
      }
    }
  }

  get pulse() {
    if (this.#pulse == null) {
      return 'quarter'
    } else {
      return this.#pulse
    }
  }

  set pulse(v) {
    const pulse = parsePulse(v)

    if (pulse != null) {
      this.#pulse = pulse
      this.#modified = this.title != ''

      this.dispatchEvent(new Event('modified'))
    }
  }

  get BPM() {
    return this.#metronome.BPM
  }

  set BPM(v) {
    const bpm = parseInt(`${v}`, 10)

    if (!Number.isNaN(bpm) && bpm >= 40 && bpm <= 200 && bpm != this.BPM) {
      this.#metronome.BPM = bpm
      this.#modified = this.title != ''

      if (this.UUID === '') {
        this.#tempo = bpm
      }

      this.dispatchEvent(new Event('modified'))
    }
  }

  get loopable() {
    const sections = transmogrify(this)
    const bars = sections.reduce((measures, section) => measures + section.measures, 0)

    return bars > 0 && bars !== INF
  }

  get loop() {
    return this.#metronome?.loop ?? false
  }

  set loop(v) {
    this.#metronome.loop = v === true
    this.dispatchEvent(new Event('modified'))
  }

  get loops() {
    const loops = Number.parseInt(`${this.#metronome?.loops ?? INF}`)

    return [2, 3, 4, 5].includes(loops) ? loops : INF
  }

  get clicks() {
    return this.#metronome?.clicks
  }

  get dings() {
    return this.#metronome?.dings
  }

  get sections() {
    return this.#sections ?? []
  }

  set sections(v) {
    this.#sections = v ?? []
  }

  copy(track) {
    this.UUID = track.UUID
    this.#version = track.#version == null ? VERSION : track.#version
    this.#title = track.title
    this.#tempo = track.tempo
    this.#timeSignature = track.timeSignature
    this.#pulse = track.pulse
    this.#sections = [...track.sections]
    this.#metronome = {
      BPM: track.#metronome.BPM,
      loop: track.#metronome.loop,
      loops: track.#metronome.loops,
      clicks: track.#metronome.clicks,
      dings: track.#metronome.dings,
    }
  }

  save() {
    if (this.#deleted != null) {
      const ms = Date.now() - this.#deleted
      const seconds = ms / 1000
      const minutes = seconds / 60
      const hours = minutes / 60
      const days = hours / 24

      if (days > RETENTION) {
        warnf(LOGTAG, `deleting track ${this.title} (past use-by date)`)
        DB.deleteTrack(this)
        this.#modified = false
        return
      }
    }

    DB.putTrack(this.object)

    this.#modified = false

    return this
  }

  delete() {
    this.#deleted ??= Date.now()

    return this
  }

  update(object) {
    this.#title = object?.title ?? this.#title
    this.#timeSignature = object?.timeSignature ?? this.#timeSignature
    this.#pulse = object?.pulse ?? this.#pulse
    this.#tempo = object?.tempo ?? this.#tempo
    this.#metronome.BPM = object?.BPM ?? this.#metronome.BPM
    this.#metronome.loop = object?.loop ?? this.#metronome.loop
    this.#metronome.loops = object?.loops ?? this.#metronome.loops

    const sections = object?.sections ?? []
    const updated = sections.filter((v, i) => i < this.#sections.length)
    const added = sections.filter((v, i) => i >= this.#sections.length)

    updated.forEach((v, i) => {
      const section = this.sections[i]

      // ... section name
      if (v.name != null && v.name !== '') {
        section.name = v.name
      } else if (v.name != null && v.name === '') {
        delete section.name
      }

      // ... section role
      if (v.role != null && v.role !== '') {
        section.role = v.role
      } else if (v.role != null && v.role === '') {
        delete section.role
      }

      // ... measures
      if (section.subsections == null || section.subsections.length == 0) {
        if (section.role === 'anacrusis') {
          section.measures = 1
        } else if (v.measures == INF) {
          section.measures = INF
        } else if (!Number.isNaN(v.measures) && v.measures >= 0) {
          section.measures = v.measures
        }
      }

      // ... pulse
      if (v.pulse == null || v.pulse === '') {
        section.pulse = null
      } else if (PULSES.includes(v.pulse)) {
        section.pulse = v.pulse
      }

      // ... tempo
      if (v.tempo == null || v.tempo === '') {
        section.tempo = null
      } else if (!Number.isNaN(v.tempo) && v.tempo >= 40 && v.tempo <= 200) {
        section.tempo = v.tempo
      }

      // ... time signature
      if (v.timeSignature == null || v.timeSignature === '') {
        section.timeSignature = null
      } else {
        section.timeSignature = v.timeSignature
      }
    })

    added.forEach((v) => {
      const name = (v.name ?? '').trim()
      const role = (v.role ?? '').trim()
      const measures = Number.parseInt(v.measures ?? '')

      if (name !== '' || role !== '' || (!Number.isNaN(measures) && measures > 0)) {
        this.#sections.push({
          name: name,
          role: role,
          measures: Number.isNaN(measures) ? INF : measures,
        })
      }
    })

    const deleted = this.sections
      .map((v, i) => {
        const name = (v.name ?? '').trim()
        const role = (v.role ?? '').trim()
        const measures = Number.parseInt(v.measures ?? '')

        return {
          i: i,
          deleted: name === '' && role === '' && measures < 1,
        }
      })
      .filter((v) => v.deleted === true)
      .map((v) => v.i)
      .reverse()

    deleted.forEach((ix) => {
      this.sections.splice(ix, 1)
    })
  }

  prune() {
    if (this.#deleted != null) {
      const ms = Date.now() - this.#deleted
      const seconds = ms / 1000
      const minutes = seconds / 60
      const hours = minutes / 60
      const days = hours / 24

      if (days > RETENTION) {
        warnf(LOGTAG, `deleting track ${this.title} (past use-by date)`)
        DB.deleteTrack(this)
        this.#modified = false
      }
    }
  }
}

function transmogrify(track) {
  return [...generators.transmogrify(track)].map((v) => {
    return {
      measures: v.measures,
    }
  })
}
