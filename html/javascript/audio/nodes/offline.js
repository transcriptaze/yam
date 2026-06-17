import * as PULSE from '../shared/constants.js'
import { parseTimeSignature, durationToMS, clamp } from '../../util.js'
import * as generators from '../../generators.js'
import { EVENTS, INF } from '../../constants.js'

const MAX_DELAY = 30000 // ms

export class OfflineNode extends AudioWorkletNode {
  #timeSignature = '4:4'
  #pulse = 'quarter'
  #subscribers = new EventTarget()

  constructor(context, { tick, tock, tack, stick, ding }) {
    super(context, 'offline', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    })

    this.port.onmessage = this.#onMessage.bind(this)

    // ... initialise worklet
    this.port.postMessage({
      message: 'initialise',

      fs: context.sampleRate,
      tick: sample(tick),
      tock: sample(tock),
      tack: sample(tack),
      ding: sample(ding),
      stick: sample(stick),
    })
  }

  #onMessage(event) {
    if (event.data.message === 'ready') {
      this.#subscribers.dispatchEvent(
        new CustomEvent(EVENTS.READY, {
          detail: {
            track: event.data.track,
          },
        }),
      )
    }
  }

  set pulse(pulse) {
    this.#pulse = pulse

    if (pulse != null) {
      const k = PULSE.pulseToInt(pulse)

      if (!Number.isNaN(k)) {
        this.parameters.get('pulse').setValueAtTime(k, this.context.currentTime)
      }
    }
  }

  set timeSignature(timeSignature) {
    this.#timeSignature = timeSignature

    if (timeSignature != null) {
      const { beats, divisions } = parseTimeSignature(timeSignature)

      if (!Number.isNaN(beats) && !Number.isNaN(divisions)) {
        this.parameters.get('divisions').setValueAtTime(divisions, this.context.currentTime)
      }
    }
  }

  render(v) {
    const ctx = this.context

    this.connect(ctx.destination)

    const wait = () => {
      return new Promise((resolve, reject) => {
        const onReady = () => {
          clearTimeout(timer)
          resolve()
        }

        const timer = setTimeout(() => {
          this.#subscribers.removeEventListener(EVENTS.READY, onReady)
          reject('Offline AudioWorklet failed to initialise')
        }, 500)

        this.#subscribers.addEventListener(EVENTS.READY, onReady, { once: true })
      })
    }

    return new Promise((resolve) => {
      this.timeSignature = v.timeSignature ?? this.timeSignature
      this.pulse = v.pulse ?? this.pulse
      this.BPM = v.BPM ?? this.BPM

      const track = transmogrify({
        UUID: v.UUID,
        tempo: v.tempo,
        timeSignature: v.timeSignature ?? this.#timeSignature,
        pulse: v.pulse ?? this.#pulse,
        BPM: v.BPM,
        loops: v.loops ?? INF,
        clicks: v.clicks ?? null,
        ding: v.ding ?? false,
        dings: v.dings ?? [],
        sections: v.sections ?? [],
      })

      this.port.postMessage({
        message: 'track',
        track: track,
      })

      // ... loop ?
      const loopable = v.loopable ?? false
      const loop = v.loop ?? false
      const dings = track.dings ?? []
      const ding = track.ding ?? false

      this.parameters.get('loop').setValueAtTime(loopable && loop ? 1 : 0, ctx.currentTime)
      this.parameters.get('ding').setValueAtTime(dings.length > 0 && ding ? 1 : 0, ctx.currentTime)

      // ... play
      this.port.postMessage({
        message: 'play',
      })

      resolve()
    })
      .then(() => wait())
      .then(() => ctx.startRendering())
  }
}

function sample(buffer) {
  const channels = buffer.numberOfChannels
  let left = new Float32Array()
  let right = new Float32Array()

  if (channels > 0) {
    left = buffer.getChannelData(0)
    right = buffer.getChannelData(0)
  }

  if (channels > 1) {
    right = buffer.getChannelData(1)
  }

  return {
    length: buffer.length,
    left: left,
    right: right,
  }
}

function transmogrify(track) {
  const sections = [...generators.transmogrify(track)].map((u) => {
    const subsections = u.subsections.map((v) => {
      return {
        ...v,
        pulse: PULSE.pulseToInt(v.pulse),
        beats: parseTimeSignature(v.timeSignature).beats,
        divisions: parseTimeSignature(v.timeSignature).divisions,
        clicks: v.clicks,
        dings: v.dings ?? [],
      }
    })

    return { ...u, subsections }
  })

  const delay = track.sections?.length ? (track.sections[0].delay ?? 0) : 0
  const bars = sections.length === 0 ? INF : sections.reduce((measures, v) => measures + v.measures, 0)

  let offset = 0
  for (const section of sections) {
    if (section.role === 'count-in') {
      offset += section.measures
    } else if (section.role === 'anacrusis') {
      offset += section.measures
    } else {
      break
    }
  }

  // ... consolidate dings
  const dings = track.dings?.map((v) => v + offset) ?? []

  sections.forEach((v) => {
    const list = v.dings?.map((x) => x + v.start - 1) ?? []

    dings.push(...list)

    v.subsections.forEach((ss) => {
      const list = ss.dings?.map((x) => x + ss.start - 1) ?? []

      dings.push(...list)
    })
  })

  dings.sort((p, q) => p - q)

  // ... playable section
  return {
    UUID: track.UUID,
    tempo: track.tempo ?? 120,
    timeSignature: track.timeSignature ?? '',
    pulse: PULSE.pulseToInt(track.pulse ?? ''),
    BPM: track.BPM,
    loop: track.loop,
    loops: track.loops ?? INF,
    clicks: generators.clicks(track.clicks),
    ding: track.ding ?? false,
    dings: dings.map((v) => `${v}`),
    delay: clamp(durationToMS(delay), 0, MAX_DELAY),

    bars: bars,
    beats: parseTimeSignature(track.timeSignature).beats,
    divisions: parseTimeSignature(track.timeSignature).divisions,
    sections: sections,
  }
}
