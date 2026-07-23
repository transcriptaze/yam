import { settings } from '../settings.js'

const widgets = {
  theme: document.querySelector('#theme'),
  soundset: document.querySelector('#soundset'),
  volume: document.querySelector('#volume'),
  volumex: document.querySelector('#volume + input[type="text"]'),
  randomise: document.querySelector('#randomise'),
  randomisex: document.querySelector('#randomise + input[type="text"]'),

  fs: document.querySelector('#fs'),
  preamble: document.querySelector('#preamble'),
  postamble: document.querySelector('#postamble'),
  duration: document.querySelector('#duration'),
  max: document.querySelector('#max'),
}

export function initialise() {
  // ... attach event handlers
  widgets.theme.addEventListener('change', (event) => onTheme(event))
  widgets.soundset.addEventListener('change', (event) => onSoundset(event))
  widgets.volume.addEventListener('input', (event) => onVolume(event))
  widgets.volume.addEventListener('change', (event) => onVolume(event))
  widgets.randomise.addEventListener('input', (event) => onRandomise(event))
  widgets.randomise.addEventListener('change', (event) => onRandomise(event))

  widgets.fs.addEventListener('change', (event) => onFS(event))
  widgets.preamble.addEventListener('change', (event) => onPreamble(event))
  widgets.postamble.addEventListener('change', (event) => onPostamble(event))
  widgets.duration.addEventListener('change', (event) => onDuration(event))
  widgets.max.addEventListener('change', (event) => onMax(event))

  // ... load settings
  settings.restore()

  widgets.theme.value = settings.theme
  widgets.soundset.value = settings.soundset
  widgets.volume.value = 10 * Math.log10(settings.volume)
  widgets.volumex.value = Math.round(20 * settings.volume) / 20
  widgets.randomise.value = settings.randomise
  widgets.randomisex.value = settings.randomise

  widgets.fs.value = settings.clickTrack.sampleRate
  widgets.preamble.value = settings.clickTrack.preamble
  widgets.postamble.value = settings.clickTrack.postamble
  widgets.duration.value = settings.clickTrack.duration
  widgets.max.value = settings.clickTrack.max
}

export function onError(err) {
  console.error('ERROR', err)

  document.querySelector('#about')?.classList.add('error')
}

function onTheme(_event) {
  const theme = widgets.theme?.value ?? 'default'

  switch (theme) {
    case 'dark':
      settings.theme = 'dark'
      settings.save()
      break

    case 'default':
      settings.theme = 'default'
      settings.save()
      break
  }
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

function onRandomise(event) {
  if (event.type === 'input') {
    const interval = widgets.randomise.value

    widgets.randomisex.value = interval
  }

  if (event.type === 'change') {
    const interval = widgets.randomise.value

    widgets.randomisex.value = interval

    settings.randomise = widgets.randomise.value
    settings.save()
  }
}

function onFS(event) {
  if (event.type === 'change') {
    const fs = Number(widgets.fs.value)

    if (fs === 44100 || fs === 48000) {
      settings.clickTrack = { sampleRate: fs }
      settings.save()
    }
  }
}

function onPreamble(event) {
  if (event.type === 'change') {
    const preamble = Number(widgets.preamble.value)

    if (preamble >= 0 && preamble <= 5) {
      settings.clickTrack = { preamble }
      settings.save()
    }
  }
}

function onPostamble(event) {
  if (event.type === 'change') {
    const postamble = Number(widgets.postamble.value)

    if (postamble >= 0 && postamble <= 5) {
      settings.clickTrack = { postamble }
      settings.save()
    }
  }
}

function onDuration(event) {
  if (event.type === 'change') {
    const duration = Number(widgets.duration.value)

    if (duration >= 0 && duration <= 10 * 60) {
      settings.clickTrack = { duration }
      settings.save()
    }
  }
}

function onMax(event) {
  if (event.type === 'change') {
    const max = Number(widgets.max.value)

    if (max >= 0 && max <= 30 * 60) {
      settings.clickTrack = { max }
      settings.save()
    }
  }
}
