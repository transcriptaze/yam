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
      { role: 'count-in',                 expected: '--role-count-in'   },
      { role: 'anacrusis',                expected: '--role-anacrusis'  },
      { role: 'intro',                    expected: '--role-intro'      },
      { role: 'verse',                    expected: '--role-verse'      },
      { role: 'verse',                    expected: '--role-verse1'     },
      { role: 'chorus',                   expected: '--role-chorus'     },
      { role: 'verse',                    expected: '--role-verse'      },
      { role: 'verse', colour: '#ff0000', expected: '#ff0000'           },
      { role: 'chorus',                   expected: '--role-chorus1'    },
      { role: 'bridge',                   expected: '--role-bridge'     },
      { role: 'turnaround',               expected: '--role-turnaround' },
      { role: 'verse',                    expected: '--role-verse'      },
      { role: 'outro',                    expected: '--role-outro'      },
      { role: '',                         expected: '--role-other'      },
      { role: '',                         expected: '--role-other1'     },
      { role: '',                         expected: '--role-other2'     },
      { role: '',                         expected: '--role-other3'     },
      { role: '',                         expected: '--role-other'      },
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
        { name: 'Chorus 1', role: 'chorus', measures: 12, clicks: [1,3], dings: [1.2] },
        {                                   subsections: [ { measures: 1, tempo: 60, timeSignature: '6:8', colour: '#ff00ff', clicks: [ 1,4 ]} ]},
        {                                   subsections: [ {              tempo: 80, timeSignature: '3:4', pulse: 'eighth', dings: [1.1]} ]},
        { name: 'Outro',    role: 'outro',  colour: '#ff0000'},
      ],
    }

    // prettier-ignore
    const expected = [
      { ID:1, role:'intro',   name:'Intro',      colour:'--role-intro',  measures:4,   start:1,   timeSignature:'4:4', dings:[],    duration:8,      subsections:[ { measures:4,   start:1,   tempo:120, timeSignature:'4:4', pulse:'quarter', clicks:null    }] },
      { ID:2, role:'verse',   name:'Verse 1',    colour:'--role-verse',  measures:8,   start:5,   timeSignature:'4:4', dings:[],    duration:21.333, subsections:[ { measures:8,   start:5,   tempo:90,  timeSignature:'4:4', pulse:'quarter', clicks:null    }] },
      { ID:3, role:'chorus',  name:'Chorus 1',   colour:'--role-chorus', measures:12,  start:13,  timeSignature:'4:4', dings:[1.2], duration:32,     subsections:[ { measures:12,  start:13,  tempo:90,  timeSignature:'4:4', pulse:'quarter', clicks:[ 1,3 ] }] },
      { ID:4, role:'role #1', name:'Section #4', colour:'--role-other',  measures:1,   start:25,  timeSignature:'6:8', dings:[],    duration:8,      subsections:[ { measures:1,   start:25,  tempo:60,  timeSignature:'6:8', pulse:'quarter', colour:'#ff00ff', clicks:[ 1,4 ], dings:[]}] },
      { ID:5, role:'role #2', name:'Section #5', colour:'--role-other1', measures:INF, start:26,  timeSignature:'3:4', dings:[],    duration:INF,    subsections:[ { measures:INF, start:26,  tempo:80,  timeSignature:'3:4', pulse:'eighth',  clicks:null,    dings:[ 1.1 ]}] },
      { ID:6, role:'outro',   name:'Outro',      colour:'#ff0000',       measures:INF, start:INF, timeSignature:'3:4', dings:[],    duration:INF,    subsections:[ { measures:INF, start:INF, tempo:80,  timeSignature:'3:4', pulse:'eighth',  clicks:null }] },
    ]

    const sections = [...generators.transmogrify(track)]

    expect(sections).to.eql(expected)
  })

  describe('tests track title generator', function () {
    it('title generator', function () {
      const titles = [
        { expected: 'Ghosts in the Static' },
        { expected: 'Electric Honey' },
        { expected: 'The Long Way Home from Yesterday' },
        { expected: 'Blueprints for Silence' },
        { expected: 'Algorithms At Midnight' },
        { expected: 'Your Shadow’s Got My Eyes' },
        { expected: 'Polaroids of a Parallel Life' },
        { expected: 'Caffeine & Catastrophe' },
        { expected: 'Second Hand Universe' },
        { expected: 'Gravity’s Just a Suggestion' },

        { expected: 'Ghosts in the Static' },
        { expected: 'Electric Honey' },
        { expected: 'The Long Way Home from Yesterday' },
        { expected: 'Blueprints for Silence' },
        { expected: 'Algorithms At Midnight' },
        { expected: 'Your Shadow’s Got My Eyes' },
        { expected: 'Polaroids of a Parallel Life' },
        { expected: 'Caffeine & Catastrophe' },
        { expected: 'Second Hand Universe' },
        { expected: 'Gravity’s Just a Suggestion' },
      ]

      const g = generators.titles()

      for (const t of titles) {
        const title = g()

        expect(title).to.equal(t.expected)
      }
    })

    it('title generator with seed', function () {
      const titles = [
        { expected: 'Algorithms At Midnight' },
        { expected: 'Your Shadow’s Got My Eyes' },
        { expected: 'Polaroids of a Parallel Life' },
        { expected: 'Caffeine & Catastrophe' },
        { expected: 'Second Hand Universe' },
        { expected: 'Gravity’s Just a Suggestion' },

        { expected: 'Ghosts in the Static' },
        { expected: 'Electric Honey' },
        { expected: 'The Long Way Home from Yesterday' },
        { expected: 'Blueprints for Silence' },
        { expected: 'Algorithms At Midnight' },
        { expected: 'Your Shadow’s Got My Eyes' },
        { expected: 'Polaroids of a Parallel Life' },
        { expected: 'Caffeine & Catastrophe' },
        { expected: 'Second Hand Universe' },
        { expected: 'Gravity’s Just a Suggestion' },

        { expected: 'Ghosts in the Static' },
        { expected: 'Electric Honey' },
        { expected: 'The Long Way Home from Yesterday' },
        { expected: 'Blueprints for Silence' },
      ]

      const g = generators.titles(4)

      for (const t of titles) {
        const title = g()

        expect(title).to.equal(t.expected)
      }
    })
  })
})
