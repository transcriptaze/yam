import { put, debugf, infof, warnf } from './DB.js'

export function hasClick(_ctx, _sound) {
  return false
}

export function getClick(ctx, sound) {
  debugf(`get click ${sound}`)

  // return new Promise((resolve, reject) => {
  //   const request = window.indexedDB.open(DB, VERSION)

  //   request.onerror = (event) => {
  //     warnf( `request::get.onerror ${event}`)
  //     reject('error retrieving ${sound}')
  //   }

  //   request.onupgradeneeded = (_event) => {
  //     warnf( 'request::get.onupgradeneeded')
  //     upgrade(event.target.result)
  //   }

  //   request.onsuccess = (event) => {
  //     const db = event.target.result
  //     const query = db.transaction(['audio']).objectStore('audio').get(sound)

  //     query.onsuccess = (event) => {
  //       if (event.target.result != null) {
  //         resolve(event.target.result)
  //       } else {
  //         fetch(`../audio/default/${sound}.wav`, GET)
  //           .then((response) => {
  //             if (response.ok) {
  //               return response.blob()
  //             } else {
  //               throw new Error(response.statusText)
  //             }
  //           })
  //           .then((blob) => blob.arrayBuffer())
  //           .then((buffer) => ctx.decodeAudioData(buffer))
  //           .then(resolve)
  //           .catch(reject)
  //       }
  //     }

  //     query.onerror = (event) => {
  //       warnf( `query::get.onerror ${event.target.error.message}`)
  //       reject('error retrieving ${sound}')
  //     }
  //   }
  // })

  throw new Error('*** NOT IMPLEMENTED ***')
}

export function putClick(sound, blob) {
  infof(`store click '${sound}'`)

  const record = {
    sound: sound,
    blob: blob,
    version: 0,
  }

  const f = (db) => {
    const transaction = db.transaction(['audio'], 'readwrite')

    transaction.onerror = (event) => {
      warnf(`${event.target.error.message}`)
    }

    const table = transaction.objectStore('audio')
    const upsert = table.put(record)

    upsert.onsuccess = (_event) => {
      infof(`stored click  '${sound}'`)
    }
  }

  put(f)

  return blob
}
