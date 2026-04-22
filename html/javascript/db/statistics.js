import { get, put, debugf, infof, warnf } from './dbx.js'

const TABLE = 'statistics'

export function statistics() {
  debugf(`get statistics`)

  const f = (db, resolve, _reject) => {
    const query = db.transaction([TABLE], 'readonly').objectStore(TABLE).getAll()

    query.onsuccess = (event) => {
      resolve(event.target.result || [])
    }

    query.onerror = (event) => {
      warnf(`query::onerror ${event.target.error.message}`)
      resolve([])
    }
  }

  return get(f)
}

export function putStatistic(record) {
  infof(`update statistic ${record.start} '${record.title}'`)

  const f = (db) => {
    const transaction = db.transaction([TABLE], 'readwrite')

    transaction.onerror = (event) => {
      warnf(`${event.target.error.message}`)
    }

    const table = transaction.objectStore(TABLE)
    const upsert = table.put(record)

    upsert.onsuccess = (_event) => {
      infof(`updated statistics for ${record.title}`)
    }
  }

  put(f)
}
