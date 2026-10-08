import { describe, it } from 'mocha'
import { expect } from 'chai'
import * as compiler from '../../html/javascript/audio/vm/compiler.js'
import * as linker from '../../html/javascript/audio/vm/linker.js'
import { OPCODES } from '../../html/javascript/audio/vm/constants.js'

describe('legacy tracks', function () {
  it.skip('jukskei', function () {
    const track = {
      UUID: '5304dd6e-32ac-4e53-8a3b-7f246cb77820',
      version: 0,
      title: 'Jukskei',
      tempo: 160,
      timeSignature: '4:4',
      pulse: 'quarter',
      sections: [
        {
          role: 'count-in',
          delay: '500ms',
          subsections: [
            {
              measures: 1,
              clicks: [1, 3],
            },
            {
              measures: 1,
              clicks: [1, 2, 3, 4],
            },
          ],
        },
        {
          name: 'Intro',
          role: 'intro',
          subsections: [
            {
              measures: 8,
            },
          ],
        },
        {
          name: 'Verse 1',
          role: 'verse',
          subsections: [
            {
              name: 'lead-in',
              measures: 8,
            },
            {
              name: 'verse',
              measures: 16,
            },
          ],
        },
        {
          name: 'Chorus 1',
          role: 'chorus',
          subsections: [
            {
              measures: 8,
            },
          ],
        },
        {
          name: 'Verse 2',
          role: 'verse',
          subsections: [
            {
              name: 'lead-in',
              measures: 8,
            },
            {
              name: 'verse',
              measures: 16,
            },
          ],
        },
        {
          name: 'Chorus 2',
          role: 'chorus',
          subsections: [
            {
              measures: 8,
            },
          ],
        },
        {
          name: '(fermata)',
          role: 'fermata',
          dings: [],
          subsections: [
            {
              measures: 1,
              timeSignature: '5:4',
              clicks: {
                1: 'sticks',
                2: 'sticks',
                3: 'sticks',
                4: 'sticks',
                5: 'tack',
              },
              colour: 'red',
            },
          ],
          timeSignature: '5:4',
        },
        {
          name: 'Mid-Eight',
          role: 'mid-eight',
          subsections: [
            {
              measures: 8,
              timeSignature: '4:4',
            },
            {
              measures: 8,
            },
          ],
          timeSignature: '4:4',
        },
        {
          name: 'Bridge',
          role: 'bridge',
          subsections: [
            {
              measures: 12,
            },
            {
              measures: 12,
            },
          ],
        },
        {
          name: 'Chorus X',
          role: 'chorus',
          subsections: [
            {
              measures: 8,
            },
          ],
        },
        {
          name: 'Last Verse',
          role: 'verse',
          subsections: [
            {
              name: 'lead-in',
              measures: 8,
            },
            {
              name: 'verse',
              measures: 16,
            },
          ],
        },
        {
          name: 'Last Chorus',
          role: 'chorus',
          subsections: [
            {
              measures: 8,
            },
            {
              measures: 8,
            },
          ],
        },
        {
          name: 'Outro',
          role: 'outro',
          subsections: [
            {
              measures: 2,
            },
            {
              measures: 1,
              tempo: 80,
              pulse: 'eighth-doublet',
              clicks: {
                1: 'tick',
                2: 'sticks',
                3: 'sticks',
                4: 'sticks',
                4.5: 'tack',
              },
            },
            {
              measures: 2,
              tempo: 160,
              pulse: 'quarter',
              clicks: {
                1: 'sticks',
                2: 'sticks',
                3: 'sticks',
                4: 'sticks',
              },
            },
          ],
        },
      ],
      tags: [],
      metronome: {
        BPM: 161,
        loop: false,
        ding: false,
      },
    }

    // prettier-ignore
    const expected = {
      UUID: '5304dd6e-32ac-4e53-8a3b-7f246cb77820',
      tempo: 160,
      delay: 0,
      loops: Number.POSITIVE_INFINITY,
      script: [
        // ... count-in
        { at: { measure: 1,   beat: 1 }, op: OPCODES.STICKS },
        { at: { measure: 1,   beat: 3 }, op: OPCODES.STICKS },
        { at: { measure: 1,   beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 2,   beat: 1 }, op: OPCODES.STICKS },
        { at: { measure: 2,   beat: 2 }, op: OPCODES.STICKS },
        { at: { measure: 2,   beat: 3 }, op: OPCODES.STICKS },
        { at: { measure: 2,   beat: 4 }, op: OPCODES.STICKS },
        { at: { measure: 2,   beat: '*' }, op: OPCODES.SKIP },

        // ... fermata
        { at: { measure: 75,  beat: 1   }, op: OPCODES.TIME_SIGNATURE, timeSignature: {beats:5, divisions:4} },
        // FIXME: { at: { measure: 75,  beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 75,  beat: 2   }, op: OPCODES.STICKS },
        { at: { measure: 75,  beat: 3   }, op: OPCODES.STICKS },
        { at: { measure: 75,  beat: 4   }, op: OPCODES.STICKS },
        { at: { measure: 75,  beat: 5   }, op: OPCODES.TACK   },
        { at: { measure: 75,  beat: '*' }, op: OPCODES.SKIP   },

        { at: { measure: 76,  beat: 1   }, op: OPCODES.TIME_SIGNATURE, timeSignature: {beats:4, divisions:4} },

        // ... outro
        { at: { measure: 166,  beat: 1   }, op: OPCODES.TEMPO, tempo: 80 },
        // FIXME: { at: { measure: 166,  beat: 1   }, op: OPCODES.SUBDIVISIONS, subdivisions: SUBDIVISIONS.EIGHTH_DOUBLETS },
        // FIXME: { at: { measure: 166,  beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 166,  beat: 2   }, op: OPCODES.STICKS },
        { at: { measure: 166,  beat: 3   }, op: OPCODES.STICKS },
        { at: { measure: 166,  beat: 4   }, op: OPCODES.STICKS },
        { at: { measure: 166,  beat: 4.5 }, op: OPCODES.TACK },
        { at: { measure: 166,  beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 167,  beat: 1   }, op: OPCODES.TEMPO, tempo: 160 },
        // FIXME: { at: { measure: 167,  beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 167,  beat: 2   }, op: OPCODES.STICKS },
        { at: { measure: 167,  beat: 3   }, op: OPCODES.STICKS },
        { at: { measure: 167,  beat: 4   }, op: OPCODES.STICKS },
        { at: { measure: 167,  beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 168,  beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 168,  beat: 2   }, op: OPCODES.STICKS },
        { at: { measure: 168,  beat: 3   }, op: OPCODES.STICKS },
        { at: { measure: 168,  beat: 4   }, op: OPCODES.STICKS },
        { at: { measure: 168,  beat: '*' }, op: OPCODES.SKIP },

        // ... rest
        { at: { measure: 169, beat: 1   }, op: OPCODES.STOP },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.TOCK },
      ],
    }

    const script = compiler.compile(track)

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })

  it('Kierboom', function () {
    const track = {
      UUID: 'd76f150d-8461-4fd9-a934-da7bf2699132',
      version: 0,
      title: 'Kierboom',
      tempo: 123,
      timeSignature: '6:8',
      pulse: 'dotted-quarter',
      sections: [
        {
          role: 'count-in',
          delay: '500ms',
          measures: 2,
          subsections: [
            {
              measures: 2,
            },
          ],
        },
        {
          role: 'intro',
          measures: 8,
          subsections: [
            {
              measures: 8,
            },
          ],
        },
        {
          name: 'Verse 1',
          role: 'verse',
          subsections: [
            {
              measures: 8,
            },
            {
              measures: 16,
            },
          ],
        },
        {
          name: 'Verse 2',
          role: 'verse',
          measures: 12,
          dings: [12.1],
          subsections: [
            {
              measures: 12,
            },
          ],
        },
        {
          name: 'Bridge 1A',
          role: 'bridge',
          measures: 12,
          dings: [1.3],
          subsections: [
            {
              measures: 12,
            },
          ],
        },
        {
          name: 'Bridge 1B',
          role: 'bridge',
          measures: 16,
          subsections: [
            {
              measures: 16,
            },
          ],
        },
        {
          name: 'Solo (main)',
          role: 'other',
          measures: 24,
          subsections: [
            {
              measures: 24,
            },
          ],
        },
        {
          name: 'Solo (variation)',
          role: 'other',
          measures: 8,
          subsections: [
            {
              measures: 8,
            },
          ],
        },
        {
          name: 'Verse 3',
          role: 'verse',
          measures: 24,
          subsections: [
            {
              measures: 24,
            },
          ],
        },
        {
          name: 'Verse 4',
          role: 'verse',
          measures: 12,
          dings: [12.1],
          subsections: [
            {
              measures: 12,
            },
          ],
        },
        {
          name: 'Bridge 2A',
          role: 'bridge',
          measures: 12,
          dings: [1.3],
          subsections: [
            {
              measures: 12,
            },
          ],
        },
        {
          name: 'Bridge 2B',
          role: 'bridge',
          measures: 16,
          subsections: [
            {
              measures: 16,
            },
          ],
        },
        {
          name: 'Dramatic Pause',
          role: 'anacrusis',
          measures: 1,
          timeSignature: '3:8',
          subsections: [
            {
              measures: 1,
              timeSignature: '3:8',
            },
          ],
        },
        {
          name: 'Outro',
          role: 'outro',
          measures: 20,
          timeSignature: '6:8',
          subsections: [
            {
              measures: 11,
              timeSignature: '6:8',
            },
          ],
        },
      ],
      tags: [],
      metronome: {
        BPM: 113,
        loop: false,
        ding: true,
      },
    }

    // prettier-ignore
    const expected = {
      UUID: 'd76f150d-8461-4fd9-a934-da7bf2699132',
      tempo: 123,
      delay: 0,
      loops: Number.POSITIVE_INFINITY,
      script: [
        // ... count-in
        { at: { measure: 1, beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 1, beat: 4   }, op: OPCODES.STICKS },
        { at: { measure: 1, beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 2, beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 2, beat: 4   }, op: OPCODES.STICKS },
        { at: { measure: 2, beat: '*' }, op: OPCODES.SKIP },

        // ... dramatic pause
        { at: { measure: 171, beat: 1   }, op: OPCODES.TIME_SIGNATURE, timeSignature: { beats:3, divisions: 8 } },
        { at: { measure: 171, beat: 1   }, op: OPCODES.STICKS },
        { at: { measure: 171, beat: '*' }, op: OPCODES.SKIP },

        { at: { measure: 172, beat: 1   }, op: OPCODES.TIME_SIGNATURE, timeSignature: { beats:6, divisions: 8 } },

        // ... rest
        { at: { measure: 183, beat: 1   }, op: OPCODES.STOP },
        { at: { measure: '*', beat: 1   }, op: OPCODES.TICK },
        { at: { measure: '*', beat: 4   }, op: OPCODES.TOCK },
        { at: { measure: '*', beat: '*' }, op: OPCODES.SKIP },
      ],
    }

    const script = compiler.compile(track)

    linker.link(script)

    expect(script).to.deep.equal(expected)
  })
})
