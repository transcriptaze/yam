import { settings } from '../settings.js'

const widgets = {
  theme: document.querySelector('#theme'),
  volume: document.querySelector('#volume'),
  volumex: document.querySelector('#volume + input[type="text"]'),
}

export function initialise() {
  // ... attach event handlers
  widgets.theme.addEventListener('change', (event) => onTheme(event))
  widgets.volume.addEventListener('input', (event) => onVolume(event))
  widgets.volume.addEventListener('change', (event) => onVolume(event))

  // ... load settings
  settings.restore()

  widgets.theme.value = settings.theme
  widgets.volume.value = settings.volume
  widgets.volumex.value = settings.volume
}

export function onError(err) {
  console.error('ERROR', err)

  document.querySelector('#about')?.classList.add('error')
}

function onTheme(event) {
  console.log(event)
}

function onVolume(event) {
  if (event.type === 'input') {
    widgets.volumex.value = widgets.volume.value
  }

  if (event.type === 'change') {
    widgets.volumex.value = widgets.volume.value

    settings.volume = widgets.volume.value
    settings.save()
  }
}
