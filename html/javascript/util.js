import { DIVISIONS, PULSES } from './constants.js'

export function parseTimeSignature(v) {
  if (`${v}` === 'common') {
    return { beats: 4, divisions: 4 }
  }

  if (`${v}` === 'cut') {
    return { beats: 2, divisions: 2 }
  }

  const matches = `${v}`.match(/([0-9]+):([0-9]+)/)

  if (matches != null) {
    const beats = parseInt(matches[1])
    const divisions = parseInt(matches[2])

    if (!Number.isNaN(beats) && !Number.isNaN(divisions) && beats >= 1 && beats <= 32 && DIVISIONS.includes(divisions)) {
      return {
        beats: beats,
        divisions: divisions,
      }
    }
  }

  return {
    beats: Number.NaN,
    divisions: Number.NaN,
  }
}

export function parsePulse(v) {
  if (PULSES.includes(`${v}`)) {
    return `${v}`
  }

  return null
}

export function durationToMS(v) {
  const value = `${v}`.replace(/\s+/g, '')
  const match = /^([\d.]+)(?:\s*(ms|s))$/.exec(value)

  if (match) {
    const [, nn, unit] = match
    const dt = parseFloat(nn)

    if (!Number.isNaN(dt)) {
      if (unit === 's') {
        return Math.max(0, 1000 * dt)
      }

      if (unit === 'ms') {
        return Math.max(0, dt)
      }

      return Math.max(0, dt)
    }
  }

  return 0
}

export function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}
