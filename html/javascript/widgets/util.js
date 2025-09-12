export const sin = (v) => {
  return Math.sin((v * Math.PI) / 180)
}

export const cos = (v) => {
  return Math.cos((v * Math.PI) / 180)
}

export const acos = (v) => {
  return (Math.acos(v) * 180) / Math.PI
}

export const atan2 = (u, v) => {
  return (Math.atan2(u, v) * 180) / Math.PI
}

export const degrees = (v) => {
  return (180.0 * v) / Math.PI
}

export const hypot = (x, y) => {
  return Math.hypot(x, y)
}

export const abs = (v) => {
  return Math.abs(v)
}

export function clamp(v, min, max) {
  if (v === Number.NEGATIVE_INFINITY) {
    return min
  }

  if (v === Number.POSITIVE_INFINITY) {
    return max
  }

  return Math.min(Math.max(v, min), max)
}
