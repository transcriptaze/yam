import * as log from '../log.js'

const LOGTAG = 'DB'
const DB = 'yam'
const VERSION = 2

export function clean() {
  indexedDB.deleteDatabase(DB)
  warnf(LOGTAG, 'deleted')
}

export function get(f) {
  return new Promise((resolve, reject) => {
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
      f(event.target.result, resolve, reject)
    }
  })
}

export function put(f) {
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

export function remove(f) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB, VERSION)

    request.onerror = (event) => {
      warnf(LOGTAG, `open::onerror ${event}`)
      resolve(false)
    }

    request.onupgradeneeded = (event) => {
      warnf(LOGTAG, 'open::onupgradeneeded')
      upgrade(event.target.result)
    }

    request.onsuccess = (event) => {
      f(event.target.result)
    }
  })
}

export function exec(f) {
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

export function debugf(msg) {
  log.debugf(LOGTAG, msg)
}

export function infof(msg) {
  log.infof(LOGTAG, msg)
}

export function warnf(msg) {
  log.warnf(LOGTAG, msg)
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
