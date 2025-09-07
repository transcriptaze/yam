import * as DB from '../db.js'

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

export function get(ctx, ...sounds) {
  return Promise.all(sounds.map((sound) => _get(ctx, sound)))
}

function _get(ctx, sound) {
  if (DB.has(ctx, sound)) {
    return DB.click(ctx, sound)
  } else {
    return new Promise((resolve, reject) => {
      fetch(`../audio/${sound}.wav`, GET)
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
