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
})
