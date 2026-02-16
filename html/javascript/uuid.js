const UUIDs = new Set()

export function reserve(set) {
  set.forEach((v) => UUIDs.add(v))
}

export function* UUIDv4() {
  const f = () => {
    if (self.crypto?.randomUUID) {
      return self.crypto.randomUUID()
    }

    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ ((Math.random() * 16) >> (c / 4))).toString(16))
  }

  let count = 0

  while (count < 16) {
    count++
    const uuid = f()

    if (!UUIDs.has(uuid)) {
      UUIDs.add(uuid)
      yield uuid
      return
    }

    console.log(`>>> WARNING: duplicate UUID {uuid}`)
  }

  throw new Error('not enough UUIDs left in the universe')
}
