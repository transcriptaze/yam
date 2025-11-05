import { settings } from '../settings.js'

const widgets = {
  theme: document.querySelector('#theme'),
  soundset: document.querySelector('#soundset'),
  volume: document.querySelector('#volume'),
  volumex: document.querySelector('#volume + input[type="text"]'),
}

export function initialise() {
  // ... attach event handlers
  widgets.theme.addEventListener('change', (event) => onTheme(event))
  widgets.soundset.addEventListener('change', (event) => onSoundset(event))
  widgets.volume.addEventListener('input', (event) => onVolume(event))
  widgets.volume.addEventListener('change', (event) => onVolume(event))

  // ... load settings
  settings.restore()

  widgets.theme.value = settings.theme
  widgets.soundset.value = settings.soundset
  widgets.volume.value = 10 * Math.log10(settings.volume)
  widgets.volumex.value = Math.round(20 * settings.volume) / 20
}

export function onError(err) {
  console.error('ERROR', err)

  document.querySelector('#about')?.classList.add('error')
}

function onTheme(event) {
  console.log(event)
}

function onSoundset(event) {
  console.log(event)
}

function onVolume(event) {
  if (event.type === 'input') {
    const volume = Math.pow(10, widgets.volume.value / 10)

    widgets.volumex.value = Math.round(20 * volume) / 20
  }

  if (event.type === 'change') {
    const volume = Math.pow(10, widgets.volume.value / 10)

    widgets.volumex.value = Math.round(20 * volume) / 20

    settings.volume = Math.round(10 * volume) / 10
    settings.save()
  }
}
