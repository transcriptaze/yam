import * as DB from '../db/db.js'
import { infof, warnf } from '../log.js'

const LOGTAG = 'soundsets'

const SOUNDS = [
  'audio/default/tick.wav',
  'audio/default/tock.wav',
  'audio/default/tack.wav',
  'audio/default/stick.wav',
  'audio/default/ding.wav',
]

const FETCH = {
  method: 'GET',
  mode: 'cors',
  credentials: 'same-origin',
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
  headers: {
    Accept: 'application/octet-stream',
    'Accept-Encoding': 'gzip',
  },
}

export function get(ctx) {
  const f = (sound) => {
    const match = new RegExp('^audio/default/(.*?)\\.wav$').exec(sound)
    const name = match[1] ?? ''
    const key = `default::${name}`

    return DB.hasClick(key).then((ok) => {
      if (ok) {
        return _get(ctx, sound, key)
      } else {
        return _fetch(ctx, sound, key)
      }
    })
  }

  const promise = Promise.all(SOUNDS.map((sound) => f(sound)))

  promise.then(() => {
    _update(ctx).catch((err) => {
      warnf(LOGTAG, `background update error ${err}`)
    })
  })

  return promise.then(([tick, tock, tack, stick, ding]) => {
    return {
      tick: tick,
      tock: tock,
      tack: tack,
      stick: stick,
      ding: ding,
    }
  })
}

function _get(ctx, sound, key) {
  const fallback = (err) => {
    warnf(LOGTAG, `${err}`)
    return _fetch(ctx, sound, key)
  }

  return DB.getClick(key)
    .then(({ blob }) => blob.arrayBuffer())
    .then((buffer) => ctx.decodeAudioData(buffer))
    .catch((err) => fallback(err))
}

function _fetch(ctx, sound, key) {
  infof(LOGTAG, `fetch ${sound}`)

  return fetch(`../${sound}`, FETCH)
    .then((response) => {
      if (response.ok) {
        return response.blob()
      } else {
        throw new Error(response.statusText)
      }
    })
    .then((blob) => DB.putClick(key, blob, 0))
    .then((blob) => blob.arrayBuffer())
    .then((buffer) => ctx.decodeAudioData(buffer))
}

function _update(_ctx) {
  return new Promise(() => {
    fetch(`../audio/samples.json`, FETCH)
      .then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error(response.statusText)
        }
      })
      .then((json) => {
        Object.entries(json).forEach(([name, v]) => {
          _check(`default::${name}`, v.version, v.file)
        })
      })
  })
}

function _check(key, version, file) {
  return DB.getClick(key).then((record) => {
    if (version > record.version) {
      infof(LOGTAG, `updating '${key}' to version ${version}`)

      fetch(`../${file}`, FETCH)
        .then((response) => {
          if (response.ok) {
            return response.blob()
          } else {
            throw new Error(response.statusText)
          }
        })
        .then((blob) => DB.putClick(key, blob, version))
    }
  })
}
