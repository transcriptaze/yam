import { get, put, exec, debugf, infof, warnf } from './DB.js'

export function playlists() {
  debugf(`get playlists`)

  const f = (db, resolve) => {
    const query = db.transaction(['playlists']).objectStore('playlists').getAll()

    query.onsuccess = (event) => {
      const rs = event.target.result
      const playlists = new Map()

      rs.forEach((v) => playlists.set(v.UUID, v))

      resolve(Array.from(playlists.values()))
    }

    query.onerror = (event) => {
      warnf(`query::onerror ${event.target.error.message}`)
      resolve([])
    }
  }

  return get(f)
}

export function putPlaylists(playlists) {
  infof(`store playlists (${playlists.length})`)

  const f = (db, resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readwrite')

    transaction.onerror = () => {
      warnf(`${transaction.error}`)
      reject(transaction.error)
    }

    transaction.onabort = () => {
      warnf(`${transaction.error}`)
      reject(transaction.error)
    }

    const table = transaction.objectStore('playlists')
    const clear = table.clear()

    clear.onerror = () => {
      warnf(`${clear.error}`)
      reject(clear.error)
    }

    clear.onsuccess = () => {
      infof(`cleared all playlists`)

      let ok = true
      for (let i = 0; i < playlists.length && ok; i++) {
        const playlist = playlists[i]
        const insert = table.put(playlist)

        insert.onerror = () => {
          warnf(`${transaction.error}`)
          ok = false
          transaction.abort()
        }

        insert.onsuccess = () => {
          debugf(`stored playlist ${playlist.title}`)
        }
      }
    }

    transaction.oncomplete = () => resolve()
  }

  exec(f)
}

export function putPlaylist(playlist) {
  infof(`store playlist '${playlist.title}'`)

  const f = (db) => {
    const transaction = db.transaction(['playlists'], 'readwrite')

    transaction.onerror = (event) => {
      warnf(`${event.target.error.message}`)
    }

    const table = transaction.objectStore('playlists')
    const rq = table.put(playlist)

    rq.onsuccess = (_event) => {
      infof(`stored playlist ${playlist.title}`)
    }
  }

  put(f)
}
