import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import html from 'rollup-plugin-html';

const isProd = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.js',
  output: {
    name: 'Leaflet.SwoopyArrow',
    file: 'build/Leaflet.SwoopyArrow.js',
    sourcemap: true,
    globals: {
      'leaflet': 'L'
    },
    format: 'umd'
  },
  external: [
    'leaflet',
  ],
  plugins: [
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    babel({
      presets: [
        ["es2015", {"modules": false}]
      ],
      plugins: ["external-helpers"],
      exclude: 'node_modules/**'
    }),
    !isProd && livereload({
      watch: ['docs', 'playground', 'build']
    }),
    !isProd && serve({
      port: 3000,
      contentBase: ['playground', 'docs', 'build']
    }),
    !isProd && html({
      include: 'playground/index.html'
    })
  ]
};
