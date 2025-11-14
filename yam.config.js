import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'html/javascript/YAM.js',
    output: {
      file: 'dist/yam/javascript/YAM.js',
      format: 'esm',
      sourcemap: false,
    },
    plugins: [
      copy({
        targets: [
          { src: 'html/index.html',       dest: 'dist/yam' },
          { src: 'html/about.html',       dest: 'dist/yam' },
          { src: 'html/settings.html',    dest: 'dist/yam' },
          { src: 'html/unsupported.html', dest: 'dist/yam' },
          { src: 'html/favicon.png',      dest: 'dist/yam' },
          { src: 'html/favicon.ico',      dest: 'dist/yam' },
          { src: 'html/css/**/*',         dest: 'dist/yam/css' },
          { src: 'html/fonts/**/*',       dest: 'dist/yam/fonts' },
          { src: 'html/images/**/*',      dest: 'dist/yam/images' },
          { src: 'html/audio/**/*',       dest: 'dist/yam/audio' },
        ],
        copyOnce: true,
      }),
    ],
  },

  {
    input: 'html/javascript/widgets/widgets.js',
    output: {
      file: 'dist/yam/javascript/widgets/widgets.js',
      format: 'esm',
      sourcemap: false,
    },
  },

  {
    input: 'html/javascript/audio/worklets/worklet.js',
    output: {
      file: 'dist/yam/javascript/audio/worklets/worklet.js',
      format: 'esm',
      sourcemap: false,
    },
  },
]
