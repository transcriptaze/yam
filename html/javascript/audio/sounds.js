import * as DB from '../db/db.js'

const SOUNDS = [
  'audio/default/tick.wav',
  'audio/default/tock.wav',
  'audio/default/tack.wav',
  'audio/default/stick.wav',
  'audio/default/ding.wav',
]

const GET = {
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
  const promise = Promise.all(SOUNDS.map((sound) => _get(ctx, sound)))

  promise.then(() => {
    _update(ctx).catch((err) => {
      console.warn(`background update error ${err}`)
    })
  })

  return promise
}

function _get(ctx, sound) {
  const match = new RegExp('^audio/default/(.*?)\\.wav$').exec(sound)
  const name = match[1] ?? ''
  const key = `default::${name}`

  return DB.hasClick(ctx, key).then((ok) => {
    console.log('>>> HAS', { key }, { ok })

    return _fetch(ctx, sound, key)
  })

  // return fetch(`../${sound}`, GET)
  //   .then((response) => {
  //     if (response.ok) {
  //       return response.blob()
  //     } else {
  //       throw new Error(response.statusText)
  //     }
  //   })
  //   .then((blob) => DB.putClick(key, blob))
  //   .then((blob) => blob.arrayBuffer())
  //   .then((buffer) => ctx.decodeAudioData(buffer))
}

function _fetch(ctx, sound, key) {
  return fetch(`../${sound}`, GET)
    .then((response) => {
      if (response.ok) {
        return response.blob()
      } else {
        throw new Error(response.statusText)
      }
    })
    .then((blob) => DB.putClick(key, blob))
    .then((blob) => blob.arrayBuffer())
    .then((buffer) => ctx.decodeAudioData(buffer))
}

function _update(_ctx) {
  return new Promise(() => {
    fetch(`../audio/samples.json`, GET)
      .then((response) => {
        if (response.ok) {
          return response.json()
        } else {
          throw new Error(response.statusText)
        }
      })
      .then((json) => {
        console.log(json)
      })
  })
}
