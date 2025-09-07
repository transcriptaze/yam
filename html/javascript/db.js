import { debugf, infof, warnf } from './log.js'

const LOGTAG = 'DB'
const DB = 'yam'
const VERSION = 2
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

export function clean() {
  indexedDB.deleteDatabase(DB)
  warnf(LOGTAG, 'deleted')
}

export function has(_ctx, _sound) {
  return false
}

export function click(ctx, sound) {
  debugf(LOGTAG, `get click ${sound}`)

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB, VERSION)

    request.onerror = (event) => {
      warnf(LOGTAG, `request::get.onerror ${event}`)
      reject('error retrieving ${sound}')
    }

    request.onupgradeneeded = (_event) => {
      warnf(LOGTAG, 'request::get.onupgradeneeded')
      upgrade(event.target.result)
    }

    request.onsuccess = (event) => {
      const db = event.target.result
      const query = db.transaction(['audio']).objectStore('audio').get(sound)

      query.onsuccess = (event) => {
        if (event.target.result != null) {
          resolve(event.target.result)
        } else {
          fetch(`../audio/default/${sound}.wav`, GET)
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
        }
      }

      query.onerror = (event) => {
        warnf(LOGTAG, `query::get.onerror ${event.target.error.message}`)
        reject('error retrieving ${sound}')
      }
    }
  })
}

export function playlists() {
  debugf(LOGTAG, `get playlists`)

  const f = (db, resolve) => {
    const query = db.transaction(['playlists']).objectStore('playlists').getAll()

    query.onsuccess = (event) => {
      const rs = event.target.result
      const playlists = new Map()

      rs.forEach((v) => playlists.set(v.UUID, v))

      resolve(Array.from(playlists.values()))
    }

    query.onerror = (event) => {
      warnf(LOGTAG, `query::onerror ${event.target.error.message}`)
      resolve([])
    }
  }

  return get(f)
}

export function tracks() {
  debugf(LOGTAG, `get tracks`)

  const f = (db, resolve) => {
    const query = db.transaction(['tracks']).objectStore('tracks').getAll()

    query.onsuccess = (event) => {
      const rs = event.target.result
      const tracks = new Map()

      rs.forEach((v) => tracks.set(v.UUID, v))

      resolve(Array.from(tracks.values()))
    }

    query.onerror = (event) => {
      warnf(LOGTAG, `query::onerror ${event.target.error.message}`)
      resolve([])
    }
  }

  return get(f)
}

export function putTracks(tracks) {
  infof(LOGTAG, `store tracks (${tracks.length})`)

  const f = (db, resolve, reject) => {
    const transaction = db.transaction(['tracks'], 'readwrite')

    transaction.onerror = () => {
      warnf(LOGTAG, `${transaction.error}`)
      reject(transaction.error)
    }

    transaction.onabort = () => {
      warnf(LOGTAG, `${transaction.error}`)
      reject(transaction.error)
    }

    const table = transaction.objectStore('tracks')
    const clear = table.clear()

    clear.onerror = () => {
      warnf(LOGTAG, `${clear.error}`)
      reject(clear.error)
    }

    clear.onsuccess = () => {
      infof(LOGTAG, `cleared all tracks`)

      let ok = true
      for (let i = 0; i < tracks.length && ok; i++) {
        const track = tracks[i]
        const insert = table.put(track)

        insert.onerror = () => {
          warnf(LOGTAG, `${transaction.error}`)
          ok = false
          transaction.abort()
        }

        insert.onsuccess = () => {
          debugf(LOGTAG, `stored track ${track.title}`)
        }
      }
    }

    transaction.oncomplete = () => resolve()
  }

  exec(f)
}

export function putTrack(track) {
  infof(LOGTAG, `store track '${track.title}'`)

  const f = (db) => {
    const transaction = db.transaction(['tracks'], 'readwrite')

    transaction.onerror = (event) => {
      warnf(LOGTAG, `${event.target.error.message}`)
    }

    const table = transaction.objectStore('tracks')
    const upsert = table.put(track)

    upsert.onsuccess = (_event) => {
      infof(LOGTAG, `stored track ${track.title}`)
    }
  }

  put(f)
}

export function deleteTrack(track) {
  infof(LOGTAG, `delete track '${track.title}'`)

  const request = window.indexedDB.open(DB, VERSION)

  request.onerror = (event) => {
    warnf(LOGTAG, `open::onerror ${event}`)
  }

  request.onupgradeneeded = (event) => {
    warnf(LOGTAG, 'open::onupgradeneeded')
    upgrade(event.target.result)
  }

  request.onsuccess = (event) => {
    debugf(LOGTAG, 'delete::onsuccess')

    const db = event.target.result
    const transaction = db.transaction(['tracks'], 'readwrite')

    transaction.onerror = (event) => {
      warnf(LOGTAG, `${event.target.error.message}`)
    }

    const table = transaction.objectStore('tracks')
    const rq = table.delete(track.UUID)

    rq.onsuccess = (_event) => {
      infof(LOGTAG, `deleted track ${track.title}`)
    }
  }
}

export function putPlaylists(playlists) {
  infof(LOGTAG, `store playlists (${playlists.length})`)

  const f = (db, resolve, reject) => {
    const transaction = db.transaction(['playlists'], 'readwrite')

    transaction.onerror = () => {
      warnf(LOGTAG, `${transaction.error}`)
      reject(transaction.error)
    }

    transaction.onabort = () => {
      warnf(LOGTAG, `${transaction.error}`)
      reject(transaction.error)
    }

    const table = transaction.objectStore('playlists')
    const clear = table.clear()

    clear.onerror = () => {
      warnf(LOGTAG, `${clear.error}`)
      reject(clear.error)
    }

    clear.onsuccess = () => {
      infof(LOGTAG, `cleared all playlists`)

      let ok = true
      for (let i = 0; i < playlists.length && ok; i++) {
        const playlist = playlists[i]
        const insert = table.put(playlist)

        insert.onerror = () => {
          warnf(LOGTAG, `${transaction.error}`)
          ok = false
          transaction.abort()
        }

        insert.onsuccess = () => {
          debugf(LOGTAG, `stored playlist ${playlist.title}`)
        }
      }
    }

    transaction.oncomplete = () => resolve()
  }

  exec(f)
}

export function putPlaylist(playlist) {
  infof(LOGTAG, `store playlist '${playlist.title}'`)

  const f = (db) => {
    const transaction = db.transaction(['playlists'], 'readwrite')

    transaction.onerror = (event) => {
      warnf(LOGTAG, `${event.target.error.message}`)
    }

    const table = transaction.objectStore('playlists')
    const rq = table.put(playlist)

    rq.onsuccess = (_event) => {
      infof(LOGTAG, `stored playlist ${playlist.title}`)
    }
  }

  put(f)
}

function upgrade(db, from, to) {
  infof(LOGTAG, `upgrading DB from version ${from} to version ${to}`)

  for (let version = from; version < to; version++) {
    if (version === 0) {
      db.createObjectStore('audio', { keyPath: 'sound' })
      db.createObjectStore('tracks', { keyPath: 'UUID' })
    }

    if (version === 1) {
      db.createObjectStore('playlists', { keyPath: 'UUID' })
    }
  }
}

function get(f) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB, VERSION)

    request.onerror = (event) => {
      warnf(LOGTAG, `open::onerror ${event}`)
      resolve([])
    }

    request.onupgradeneeded = (event) => {
      warnf(LOGTAG, 'open::onupgradeneeded')

      const db = event.target.result
      const from = event.oldVersion
      const to = event.newVersion

      upgrade(db, from, to)
    }

    request.onsuccess = (event) => {
      f(event.target.result, resolve)
    }
  })
}

function put(f) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB, VERSION)

    request.onerror = (event) => {
      warnf(LOGTAG, `open::onerror ${event}`)
      resolve([])
    }

    request.onupgradeneeded = (event) => {
      warnf(LOGTAG, 'open::onupgradeneeded')

      const db = event.target.result
      const from = event.oldVersion
      const to = event.newVersion

      upgrade(db, from, to)
    }

    request.onsuccess = (event) => {
      f(event.target.result)
    }
  })
}

function exec(f) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB, VERSION)

    request.onerror = () => {
      warnf(LOGTAG, `open::onerror ${request.error}`)
      reject(request.error)
    }

    request.onupgradeneeded = (event) => {
      warnf(LOGTAG, 'open::onupgradeneeded')

      const db = event.target.result
      const from = event.oldVersion
      const to = event.newVersion

      upgrade(db, from, to)
    }

    request.onsuccess = (event) => {
      f(event.target.result, resolve, reject)
    }
  })
}
