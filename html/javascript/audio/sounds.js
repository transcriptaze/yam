import * as DB from '../db.js'

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
  if (DB.has(ctx, sound)) {
    return DB.click(ctx, sound)
  } else {
    return new Promise((resolve, reject) => {
      fetch(`../${sound}`, GET)
        .then((response) => {
          if (response.ok) {
            return response.blob()
          } else {
            throw new Error(response.statusText)
          }
        })
        .then((blob) => blob.arrayBuffer())
        .then((buffer) => ctx.decodeAudioData(buffer))
        .then(resolve)
        .catch(reject)
    })
  }
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
