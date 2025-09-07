export function* UUIDv4(set) {
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

    if (!set.has(uuid)) {
      yield uuid
      return
    }
  }

  throw new Error('not enough UUIDs left in the universe')
}
