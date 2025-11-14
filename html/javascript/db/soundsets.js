import { get, put, infof, warnf } from './dbx.js'

export function hasClick(sound) {
  const f = (db, resolve, _reject) => {
    const query = db.transaction(['audio']).objectStore('audio').getKey(sound)

    query.onsuccess = (event) => {
      const rs = event.target.result

      resolve(rs === sound)
    }

    query.onerror = (event) => {
      warnf(`query::onerror ${event.target.error.message}`)
      resolve(false)
    }
  }

  return get(f)
}

export function getClick(sound) {
  const f = (db, resolve, reject) => {
    const query = db.transaction(['audio']).objectStore('audio').get(sound)

    query.onsuccess = (event) => {
      const rs = event.target.result

      if (rs != null) {
        resolve({
          sound: rs.sound,
          version: rs.version,
          blob: rs.blob,
        })
      } else {
        reject(`no DB record for '${sound}'`)
      }
    }

    query.onerror = (event) => {
      reject(`${event.target.error.message}`)
    }
  }

  return get(f)
}

export function putClick(sound, blob, version) {
  infof(`store click '${sound}'`)

  const record = {
    sound: sound,
    blob: blob,
    version: !Number.isNaN(version) && version > 0 ? version : 0,
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
