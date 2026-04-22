import { describe, it } from 'mocha'
import { expect } from 'chai'
import { UUIDv4 } from '../../html/javascript/uuid.js'

describe('tests UUIDv4 functions', function () {
  it('next', function () {
    const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const list = Array.from({ length: 64 }, () => UUIDv4().next().value)
    const set = new Set(list)

    expect(set.size).to.equal(64)

    list.forEach((uuid) => {
      expect(uuid).to.match(re)
    })
  })
})
