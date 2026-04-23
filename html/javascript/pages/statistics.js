import * as statistics from '../statistics/statistics.js'
import * as fs from '../fs.js'

// const widgets = {}

export function initialise() {
  // ... attach event handlers
  // ... load statistics
  // ... display statistics
}

export function onSave() {
  statistics.get().then((object) => {
    fs.saveStatistics(object)
  })
}

export function onError(err) {
  console.error('ERROR', err)

  document.querySelector('#about')?.classList.add('error')
}
