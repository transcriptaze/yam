export function load(callback) {
  if (window.showOpenFilePicker) {
    loadWithPicker(callback)
  } else {
    loadWithChooser(callback)
  }
}

export function save(object) {
  const now = new Date()
  const year = now.getFullYear().toString().padStart(4, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  const filename = `YAM ${year}-${month}-${day} ${hour}${minute}${second}.yam`

  const replacer = (k, v) => (v == null || (typeof v === 'number' && !Number.isFinite(v)) ? undefined : v)
  const json = JSON.stringify(object, replacer, '  ')
  const blob = new Blob([json], { type: 'application/x-yam' })

  if (window.showSaveFilePicker) {
    saveWithPicker(blob, filename)
  } else {
    saveWithChooser(blob, filename)
  }
}

export function saveStatistics(object) {
  const now = new Date()
  const year = now.getFullYear().toString().padStart(4, '0')
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  const filename = `YAM ${year}-${month}-${day} ${hour}${minute}${second}.statistics`

  const replacer = (k, v) => (v == null || (typeof v === 'number' && !Number.isFinite(v)) ? undefined : v)
  const json = JSON.stringify(object, replacer, '  ')
  const blob = new Blob([json], { type: 'application/x-yam-statistics' })

  if (window.showSaveFilePicker) {
    saveWithPicker(blob, filename)
  } else {
    saveWithChooser(blob, filename)
  }
}

export function saveWavFile(filename, buffer) {
  console.log(buffer)
  const length = buffer.length * buffer.numberOfChannels * 2 + 44
  const bytes = new ArrayBuffer(length)
  const view = new DataView(bytes)
  let offset = 0

  const setUint16 = (data) => {
    view.setUint16(offset, data, true)
    offset += 2
  }
  const setUint32 = (data) => {
    view.setUint32(offset, data, true)
    offset += 4
  }

  const clamp = (v, min, max) => {
    return Math.min(Math.max(v, min), max)
  }

  // Conversion formula: sample = (isample * 2 + 1)/65535
  //
  // e.g.:
  //   ( 0*2     + 1)/65535 =  0.0000152590219
  //   (-1*2     + 1)/65535 = -0.0000152590219
  //   ( 32767*2 + 1)/65535 =  1
  //   (-32768*2 + 1)/65535 = -1
  const pcm16 = (sample) => {
    return Math.floor((65535 * clamp(sample, -1.0, +1.0) - 1) / 2)
  }

  // ... WAV header
  // prettier-ignore
  {
    setUint32(0x46464952)                                      // "RIFF"
    setUint32(length - 8)                                      // file length - 8
    setUint32(0x45564157)                                      // "WAVE"
    setUint32(0x20746d66)                                      // "fmt " chunk
    setUint32(16)                                              // chunk length
    setUint16(1)                                               // sample format (raw)
    setUint16(buffer.numberOfChannels)                         // channel count
    setUint32(buffer.sampleRate)                               // sample rate
    setUint32(buffer.sampleRate * buffer.numberOfChannels * 2) // byte rate
    setUint16(buffer.numberOfChannels * 2)                     // block align
    setUint16(16)                                              // bits per sample
    setUint32(0x61746164)                                      // "data" chunk
    setUint32(length - offset - 4)                             // chunk length    
  }

  // ... interleaved audio data
  const channels = []
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    channels.push(buffer.getChannelData(channel))
  }

  let ix = 0
  while (offset < length) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sample = channels[channel][ix]
      const isample = pcm16(sample)

      view.setInt16(offset, isample, true)
      offset += 2
    }

    ix++
  }

  const blob = new Blob([bytes], { type: 'audio/wav' })

  if (window.showSaveFilePicker) {
    saveWithPicker(blob, filename)
  } else {
    saveWithChooser(blob, filename)
  }
}

async function saveWithPicker(blob, filename) {
  let accepts = { 'application/x-yam': ['.yam'] }

  if (blob.type === 'application/x-yam-statistics') {
    accepts = { 'application/x-yam-statistics': ['.statistics', '.json'] }
  }

  if (blob.type === 'audio/wav') {
    accepts = { 'audio/wav': ['.wav'] }
  }

  const options = {
    suggestedName: filename,
    types: [
      {
        description: 'YAM file',
        accept: accepts,
      },
    ],
  }

  try {
    const handle = await window.showSaveFilePicker(options)
    const stream = await handle.createWritable()

    await stream.write(blob)
    await stream.close()
  } catch (err) {
    if (err.name == 'NotAllowedError') {
      saveWithChooser(blob, filename)
    } else if (err.name !== 'AbortError') {
      console.error(err)
    }
  }
}

async function saveWithChooser(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.querySelector('a#export')

  anchor.href = url
  anchor.download = filename
  anchor.click()

  URL.revokeObjectURL(url)
}

function loadWithPicker(callback) {
  const options = {
    id: 'yam',
    multiple: false,
    types: [
      {
        description: 'YAM file',
        accept: {
          'application/x-yam': ['.yam'],
        },
      },
    ],
  }

  window
    .showOpenFilePicker(options)
    .then((files) => files[0].getFile())
    .then((file) => {
      const filename = file.name

      return file
        .text()
        .then(JSON.parse)
        .then((object) => callback(filename, object, null))
        .catch((err) => callback(filename, null, err))
    })
    .catch((err) => {
      if (err.name == 'NotAllowedError') {
        loadWithChooser(callback)
      } else if (err.name !== 'AbortError') {
        callback(null, null, err)
      }
    })
}

function loadWithChooser(callback) {
  const file = document.getElementById('picker')

  file.value = ''
  file.accept = '.yam, application/x-yam'

  file.onchange = async (e) => {
    const files = e.target.files

    if (files.length > 0) {
      const filename = files.item(0).name

      files
        .item(0)
        .text()
        .then((json) => JSON.parse(json))
        .then((object) => callback(filename, object, null))
        .catch((err) => callback(filename, null, err))
    }
  }

  file.click()
}
