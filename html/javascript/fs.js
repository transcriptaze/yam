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

async function saveWithPicker(blob, filename) {
  let accepts = { 'application/x-yam': ['.yam'] }

  if (blob.type === 'application/x-yam-statistics') {
    accepts = { 'application/x-yam-statistics': ['.statistics', '.json'] }
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
