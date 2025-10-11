import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'html/javascript/YAM.js',
    output: {
      file: 'dist/rollup/javascript/YAM.js',
      format: 'esm',
      sourcemap: false,
    },
    plugins: [
      copy({
        targets: [
          { src: 'html/index.html',       dest: 'dist/rollup' },
          { src: 'html/about.html',       dest: 'dist/rollup' },
          { src: 'html/settings.html',    dest: 'dist/rollup' },
          { src: 'html/unsupported.html', dest: 'dist/rollup' },
          { src: 'html/favicon.png',      dest: 'dist/rollup' },
          { src: 'html/favicon.ico',      dest: 'dist/rollup' },
          { src: 'html/css/**/*',         dest: 'dist/rollup/css' },
          { src: 'html/fonts/**/*',       dest: 'dist/rollup/fonts' },
          { src: 'html/images/**/*',      dest: 'dist/rollup/images' },
          { src: 'html/audio/**/*',       dest: 'dist/rollup/audio' },
        ],
        copyOnce: true,
      }),
    ],
  },

  {
    input: 'html/javascript/widgets/widgets.js',
    output: {
      file: 'dist/rollup/javascript/widgets/widgets.js',
      format: 'esm',
      sourcemap: false,
    },
  },

  {
    input: 'html/javascript/audio/worklets/worklet.js',
    output: {
      file: 'dist/rollup/javascript/audio/worklets/worklet.js',
      format: 'esm',
      sourcemap: false,
    },
  },
]
