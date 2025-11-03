import { get, put, exec, debugf, infof, warnf } from './db.js'

export function tracks() {
  debugf(`get tracks`)

  const f = (db, resolve, _reject) => {
    const query = db.transaction(['tracks']).objectStore('tracks').getAll()

    query.onsuccess = (event) => {
      const rs = event.target.result
      const tracks = new Map()

      rs.forEach((v) => tracks.set(v.UUID, v))

      resolve(Array.from(tracks.values()))
    }

    query.onerror = (event) => {
      warnf(`query::onerror ${event.target.error.message}`)
      resolve([])
    }
  }

  return get(f)
}

export function putTracks(tracks) {
  infof(`store tracks (${tracks.length})`)

  const f = (db, resolve, reject) => {
    const transaction = db.transaction(['tracks'], 'readwrite')

    transaction.onerror = () => {
      warnf(`${transaction.error}`)
      reject(transaction.error)
    }

    transaction.onabort = () => {
      warnf(`${transaction.error}`)
      reject(transaction.error)
    }

    const table = transaction.objectStore('tracks')
    const clear = table.clear()

    clear.onerror = () => {
      warnf(`${clear.error}`)
      reject(clear.error)
    }

    clear.onsuccess = () => {
      infof(`cleared all tracks`)

      let ok = true
      for (let i = 0; i < tracks.length && ok; i++) {
        const track = tracks[i]
        const insert = table.put(track)

        insert.onerror = () => {
          warnf(`${transaction.error}`)
          ok = false
          transaction.abort()
        }

        insert.onsuccess = () => {
          debugf(`stored track ${track.title}`)
        }
      }
    }

    transaction.oncomplete = () => resolve()
  }

  exec(f)
}

export function putTrack(track) {
  infof(`store track '${track.title}'`)

  const f = (db) => {
    const transaction = db.transaction(['tracks'], 'readwrite')

    transaction.onerror = (event) => {
      warnf(`${event.target.error.message}`)
    }

    const table = transaction.objectStore('tracks')
    const upsert = table.put(track)

    upsert.onsuccess = (_event) => {
      infof(`stored track ${track.title}`)
    }
  }

  put(f)
}
