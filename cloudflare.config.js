import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'html/javascript/YAM.js',
    output: {
      file: 'dist/cloudflare/javascript/YAM.js',
      format: 'esm',
      sourcemap: false,
    },
    plugins: [
      copy({
        targets: [
          { src: 'html/index.html',       dest: 'dist/cloudflare' },
          { src: 'html/about.html',       dest: 'dist/cloudflare' },
          { src: 'html/settings.html',    dest: 'dist/cloudflare' },
          { src: 'html/unsupported.html', dest: 'dist/cloudflare' },
          { src: 'html/favicon.png',      dest: 'dist/cloudflare' },
          { src: 'html/favicon.ico',      dest: 'dist/cloudflare' },
          { src: 'html/css/**/*',         dest: 'dist/cloudflare/css' },
          { src: 'html/fonts/**/*',       dest: 'dist/cloudflare/fonts' },
          { src: 'html/images/**/*',      dest: 'dist/cloudflare/images' },
          { src: 'html/audio/**/*',       dest: 'dist/cloudflare/audio' },
        ],
        copyOnce: true,
      }),
    ],
  },

  {
    input: 'html/javascript/widgets/widgets.js',
    output: {
      file: 'dist/cloudflare/javascript/widgets/widgets.js',
      format: 'esm',
      sourcemap: false,
    },
  },

  {
    input: 'html/javascript/audio/worklets/worklet.js',
    output: {
      file: 'dist/cloudflare/javascript/audio/worklets/worklet.js',
      format: 'esm',
      sourcemap: false,
    },
  },
]
