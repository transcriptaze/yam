import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Track } from '../../html/javascript/models/track.js'

describe('tests the Track model', function () {
  it('object constructor without tags', function () {
    const object = {
      UUID: 'fbadae70-a1a1-4093-be74-bb255ca5c7b2',
    }

    const track = new Track(object)
    const tags = track.tags

    expect(tags).to.deep.equal([])
  })

  it('object constructor with tags', function () {
    const object = {
      UUID: 'fbadae70-a1a1-4093-be74-bb255ca5c7b2',
      tags: ['ok', 'drop D'],
    }

    const track = new Track(object)
    const tags = track.tags

    expect(tags).to.deep.equal(['ok', 'drop D'])
  })

  it('get::object property', function () {
    const object = {
      UUID: 'fbadae70-a1a1-4093-be74-bb255ca5c7b2',
      tags: ['ok', 'drop D'],
    }

    const track = new Track(object)
    const obj = track.object

    expect(obj.tags).to.deep.equal(['ok', 'drop D'])
  })

  it('copy(...)', function () {
    const object = {
      UUID: 'fbadae70-a1a1-4093-be74-bb255ca5c7b2',
      tags: ['ok', 'drop D'],
    }

    const track = new Track(object)
    const clone = new Track({})

    expect(clone.UUID).to.equal('')
    expect(clone.tags).to.deep.equal([])

    clone.copy(track)

    expect(clone.UUID).to.equal('fbadae70-a1a1-4093-be74-bb255ca5c7b2')
    expect(clone.tags).to.deep.equal(['ok', 'drop D'])
  })

  it('update(...)', function () {
    const object = {
      UUID: 'fbadae70-a1a1-4093-be74-bb255ca5c7b2',
      tags: ['ok', 'drop D'],
    }

    const track = new Track(object)

    expect(track.UUID).to.equal('fbadae70-a1a1-4093-be74-bb255ca5c7b2')
    expect(track.tags).to.deep.equal(['ok', 'drop D'])

    track.update({
      tags: ['archived'],
    })

    expect(track.UUID).to.equal('fbadae70-a1a1-4093-be74-bb255ca5c7b2')
    expect(track.tags).to.deep.equal(['archived'])
  })
})
