import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'html/javascript/YAM.js',
    output: {
      file: 'dist/yam/html/javascript/YAM.js',
      format: 'esm',
      sourcemap: false,
    },
    plugins: [
      copy({
        targets: [
          { src: 'html/index.html',       dest: 'dist/yam/html' },
          { src: 'html/about.html',       dest: 'dist/yam/html' },
          { src: 'html/settings.html',    dest: 'dist/yam/html' },
          { src: 'html/unsupported.html', dest: 'dist/yam/html' },
          { src: 'html/favicon.png',      dest: 'dist/yam/html' },
          { src: 'html/favicon.ico',      dest: 'dist/yam/html' },
          { src: 'html/css/**/*',         dest: 'dist/yam/html/css' },
          { src: 'html/fonts/**/*',       dest: 'dist/yam/html/fonts' },
          { src: 'html/images/**/*',      dest: 'dist/yam/html/images' },
          { src: 'html/audio/**/*',       dest: 'dist/yam/html/audio' },
        ],
        copyOnce: true,
      }),
    ],
  },

  {
    input: 'html/javascript/widgets/widgets.js',
    output: {
      file: 'dist/yam/html/javascript/widgets/widgets.js',
      format: 'esm',
      sourcemap: false,
    },
  },

  {
    input: 'html/javascript/audio/worklets/worklet.js',
    output: {
      file: 'dist/yam/html/javascript/audio/worklets/worklet.js',
      format: 'esm',
      sourcemap: false,
    },
  },
]
