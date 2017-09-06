import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
import butternut from 'rollup-plugin-butternut';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

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
    '@turf/helpers',
    '@turf/center'
  ],
  globals: {
    'leaflet': 'L',
    '@turf/helpers': 'turf',
    '@turf/center': 'turf'
  },
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
      watch: ['examples', 'build']
    }),
    !isProd && serve({
      port: 3000,
      contentBase: ['examples', 'build']
    })
  ]
};
