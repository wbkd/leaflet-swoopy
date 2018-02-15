import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import html from 'rollup-plugin-html';

const isProd = process.env.NODE_ENV === 'production';

export default {
  name: 'Leaflet.SwoopyArrow',
  input: 'src/index.js',
  output: {
    file: 'build/Leaflet.SwoopyArrow.js',
    format: 'umd'
  },
  sourcemap: true,
  external: [
    'leaflet',
  ],
  globals: {
    'leaflet': 'L'
  },
  plugins: [
    resolve(),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    commonjs({
      include: ['node_modules/@turf/**/*']
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
