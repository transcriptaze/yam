import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as generators from '../../../html/javascript/generators.js'

describe('tests section name generator', function () {
  it('name generator', function () {
    // prettier-ignore
    const sections = [
      { role: 'count-in',  expected: 'Count In' },
      { role: 'anacrusis', expected: 'Pickup' },
      { role: 'intro',     expected: 'Intro' },
      { role: 'verse',     expected: 'Verse #1' },
      { role: 'verse',     expected: 'Verse #2' },
      { role: 'chorus',    expected: 'Chorus #1' },
      { role: 'verse',     expected: 'Verse #3' },
      { role: 'chorus',    expected: 'Chorus #2' },
      { role: 'bridge',    expected: 'Bridge #1' },
      { role: 'turnaround',expected: 'Turnaround' },
      { role: 'verse',     expected: 'Verse #4' },
      { role: 'outro',     expected: 'Outro' },
    ]

    const g = generators.names()

    for (const section of sections) {
      const name = g(null, section.role)

      expect(name).to.equal(section.expected)
    }
  })

  it('multiple name generator', function () {
    // prettier-ignore
    const sections = [
      { role: 'count-in',   expected: 'Count In' },
      { role: 'anacrusis',  expected: 'Pickup' },
      { role: 'intro',      expected: 'Intro' },
      { role: 'verse',      expected: 'Verse #1' },
      { role: 'verse',      expected: 'Verse #2' },
      { role: 'chorus',     expected: 'Chorus #1' },
      { role: 'verse',      expected: 'Verse #3' },
      { role: 'chorus',     expected: 'Chorus #2' },
      { role: 'bridge',     expected: 'Bridge #1' },
      { role: 'turnaround', expected: 'Turnaround' },
      { role: 'verse',      expected: 'Verse #4' },
      { role: 'outro',      expected: 'Outro' },
    ]

    const f = generators.names()

    for (const section of sections) {
      const name = f(null, section.role)

      expect(name).to.equal(section.expected)
    }

    const g = generators.names()

    for (const section of sections) {
      const name = g(null, section.role)

      expect(name).to.equal(section.expected)
    }
  })

  it('names for misc roles', function () {
    // prettier-ignore
    const sections = [
      { role: 'count-in',  expected: 'Count In' },
      { role: 'anacrusis', expected: 'Pickup' },
      { role: 'intro',     expected: 'Intro' },
      { role: 'verse',     expected: 'Verse #1' },
      { role: 'role #1',   expected: 'Section #3' },
      { role: 'chorus',    expected: 'Chorus #1' },
      { role: 'role #2',   expected: 'Section #5' },
    ]

    const g = generators.names()

    for (const section of sections) {
      const name = g(null, section.role)

      expect(name).to.equal(section.expected)
    }
  })

  it('missing verse name generator', function () {
    // prettier-ignore
    const sections = [
      { name: 'Beginning', role: 'verse', expected: 'Beginning' },
      {                    role: 'verse', expected: 'Verse #2' },
      { name: 'Le Verse',  role: 'verse', expected: 'Le Verse' },
      {                    role: 'verse', expected: 'Verse #4' },
      { name: 'Ending',    role: 'verse', expected: 'Ending' },
    ]

    const g = generators.names()

    for (const section of sections) {
      const name = g(section.name, section.role)

      expect(name).to.equal(section.expected)
    }
  })

  it('missing section name generator', function () {
    // prettier-ignore
    const sections = [
      {                     role: 'count-in',  expected: 'Count In' },
      {                     role: 'anacrusis', expected: 'Pickup' },
      { name: 'Beginning',  role: 'verse',     expected: 'Beginning' },
      {                     role: 'verse',     expected: 'Verse #2' },
      {                     role: 'section',   expected: 'Section #3' },
      { name: 'Le Section', role: 'section',   expected: 'Le Section' },
      {                     role: 'section',   expected: 'Section #5' },
      {                     role: 'verse',     expected: 'Verse #3' },
      {                     role: 'section',   expected: 'Section #7' },
    ]

    const g = generators.names()

    for (const section of sections) {
      const name = g(section.name, section.role)

      expect(name).to.equal(section.expected)
    }
  })
})

describe('tests section role generator', function () {
  it('role generator', function () {
    // prettier-ignore
    const sections = [
      { role: 'count-in',   expected: 'count-in' },
      { role: 'anacrusis',  expected: 'anacrusis'},
      { role: 'intro',      expected: 'intro' },
      { role: 'verse',      expected: 'verse' },
      { role: 'verse',      expected: 'verse' },
      { role: 'chorus',     expected: 'chorus' },
      { role: 'verse',      expected: 'verse' },
      { role: 'chorus',     expected: 'chorus' },
      { role: 'bridge',     expected: 'bridge' },
      { role: 'turnaround', expected: 'turnaround' },
      { role: 'verse',      expected: 'verse' },
      { role: 'outro',      expected: 'outro' },
      { role: '',           expected: 'role #1' },
      { role: '',           expected: 'role #2' },
      { role: '',           expected: 'role #3' },
      { role: '',           expected: 'role #4' },
      { role: '',           expected: 'role #1' },
    ]

    const g = generators.roles()

    for (const section of sections) {
      const role = g(section.role)

      expect(role).to.equal(section.expected)
    }
  })
})

describe('tests section colour generator', function () {
  it('colour generator', function () {
    // prettier-ignore
    const sections = [
      { role: 'count-in',                 expected: '#d69574' },
      { role: 'anacrusis',                expected: '#cbb469' },
      { role: 'intro',                    expected: '#df8880' },
      { role: 'verse',                    expected: '#b3bc69' },
      { role: 'verse',                    expected: '#64aa6f' },
      { role: 'chorus',                   expected: '#84b5d2' },
      { role: 'verse',                    expected: '#b3bc69' },
      { role: 'verse', colour: '#ff0000', expected: '#ff0000' },
      { role: 'chorus',                   expected: '#3e7eb3' },
      { role: 'bridge',                   expected: '#a7a8cb' },
      { role: 'turnaround',               expected: '#da8aaa' },
      { role: 'verse',                    expected: '#b3bc69' },
      { role: 'outro',                    expected: '#86c0b5' },
      { role: '',                         expected: '#cb96b2' },
      { role: '',                         expected: '#71a9a0' },
      { role: '',                         expected: '#b29f69' },
      { role: '',                         expected: '#7197b8' },
      { role: '',                         expected: '#cb96b2' },
    ]

    const g = generators.colours()

    for (const section of sections) {
      const colour = g(section.colour, section.role)

      expect(colour).to.equal(section.expected)
    }
  })
})

describe('tests track sections transmogrify', function () {
  it('transmogrify', function () {
    const INF = Number.POSITIVE_INFINITY

    // prettier-ignore
    const track = {
      BPM: 120,
      timeSignature: '4:4',
      pulse: 'quarter',

      sections: [
        { name: 'Intro',    role: 'intro',  measures: 4},
        { name: 'Verse 1',  role: 'verse',  measures: 8,  tempo: 90  },
        { name: 'Chorus 1', role: 'chorus', measures: 12, clicks: [1,3] },
        {                                   subsections: [ { measures: 1, tempo: 60, timeSignature: '6:8', clicks: [ 1,4 ]} ]},
        {                                   subsections: [ {              tempo: 80, timeSignature: '3:4', pulse: 'eighth'} ]},
        { name: 'Outro',    role: 'outro',  colour: '#ff0000'},
      ],
    }

    // prettier-ignore
    const expected = [
      { ID: 1, role: 'intro',   name: 'Intro',      colour: '#df8880', measures: 4,   start: 1,   timeSignature: '4:4', subsections: [ { measures: 4,   tempo: 120, timeSignature: '4:4', pulse: 'quarter', clicks: null    }] },
      { ID: 2, role: 'verse',   name: 'Verse 1',    colour: '#b3bc69', measures: 8,   start: 5,   timeSignature: '4:4', subsections: [ { measures: 8,   tempo: 90,  timeSignature: '4:4', pulse: 'quarter', clicks: null    }] },
      { ID: 3, role: 'chorus',  name: 'Chorus 1',   colour: '#84b5d2', measures: 12,  start: 13,  timeSignature: '4:4', subsections: [ { measures: 12,  tempo: 90,  timeSignature: '4:4', pulse: 'quarter', clicks: [ 1,3 ] }] },
      { ID: 4, role: 'role #1', name: 'Section #4', colour: '#cb96b2', measures: 1,   start: 25,  timeSignature: '6:8', subsections: [ { measures: 1,   tempo: 60,  timeSignature: '6:8', pulse: 'quarter', clicks: [ 1,4 ] }] },
      { ID: 5, role: 'role #2', name: 'Section #5', colour: '#71a9a0', measures: INF, start: 26,  timeSignature: '3:4', subsections: [ { measures: INF, tempo: 80,  timeSignature: '3:4', pulse: 'eighth',  clicks: null    }] },
      { ID: 6, role: 'outro',   name: 'Outro',      colour: '#ff0000', measures: INF, start: INF, timeSignature: '3:4', subsections: [ { measures: INF, tempo: 80,  timeSignature: '3:4', pulse: 'eighth',  clicks: null    }] },
    ]

    const sections = [...generators.transmogrify(track)]

    expect(sections).to.eql(expected)
  })
})
