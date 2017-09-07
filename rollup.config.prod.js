import butternut from 'rollup-plugin-butternut';
import config from './rollup.config';

config.output.file = 'build/Leaflet.SwoopyArrow.min.js';
config.plugins.push(butternut());

export default config;
