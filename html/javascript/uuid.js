export function* UUIDv4() {
  const f = () => {
    const uuidFn = self.crypto?.randomUUID
    if (typeof uuidFn === 'function') {
      return uuidFn.call(self.crypto)
    }

    const bytes = new Uint8Array(16)

    if (typeof self.crypto?.getRandomValues === 'function') {
      self.crypto.getRandomValues(bytes)
    } else {
      bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 256)))
    }

    let i = 0
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (c ^ (bytes[i++] & (15 >> (c / 4)))).toString(16))
  }

  while (true) {
    yield f()
  }
}
