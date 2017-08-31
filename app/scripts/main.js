// const swoopyArrowHelper = require('./swoopyArrow').default;
const TurfBezier = require('turf-bezier');
const L = require('leaflet');
const curve = require('leaflet-curve');


const map = L.map('map', {
  renderer: L.svg()
}).setView([52.52, 13.4], 9);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.SwoopyArrow = L.Layer.extend({
  options: {
    fromLatlng: [],
    toLatlng: [],
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);

    this._fromLatlng = L.latLng(this.options.fromLatlng);
    this._toLatlng = L.latLng(this.options.toLatlng);

    this._initSVG();
  },

  _initSVG: function () {
    this._svg = L.SVG.create('svg');

    this._arrow = this._createArrow();
    this._svg.appendChild(this._arrow);
  },

  onAdd: function (map) {
    this._map = map;
    this.getPane().appendChild(this._svg);

    this.update();
  },


  getEvents: function () {
    return {
      zoom: this.update,
      viewreset: this.update
    };
  },

  _createArrow: function () {
    const container = L.SVG.create('defs');
    const marker = L.SVG.create('marker');
    const path = L.SVG.create('polyline');

    L.DomUtil.addClass(marker, 'leaflet-swoopyarrow');
    L.DomUtil.addClass(path, 'leaflet-swoopyarrow__path');

    marker.setAttribute('id', 'swoopyarrow__arrowhead');
    marker.setAttribute('markerWidth', '20');
    marker.setAttribute('markerHeight', '20');
    marker.setAttribute('viewBox', '-10 -10 20 20');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('refX', '0');
    marker.setAttribute('refY', '0');
    marker.setAttribute('fill', 'none');
    marker.setAttribute('stroke', 'red');
    marker.setAttribute('stroke-width', '1');

    path.setAttribute('stroke-linejoin', 'bevel');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'red');
    path.setAttribute('points', '-6.75,-6.75 0,0 -6.75,6.75');

    marker.appendChild(path);
    container.appendChild(marker);

    return container;
  },

  _createPath: function () {
    //quadratic bezier curve
    const curvePoint = this._calcBezierControlPoints(this._fromLatlng, this._toLatlng, 8);

    const pathOne = L.curve(
      [
        'M', [this._fromLatlng.lat, this._fromLatlng.lng],
        'Q', curvePoint, [this._toLatlng.lat, this._toLatlng.lng]

      ], {
        animate: false,
        color: 'red',
        fill: false,
        weight: 1,
        className: 'pathone'
      }
    ).addTo(map);

    const pathNode = document.querySelector('.pathone');
    pathNode.setAttribute('marker-end', 'url(#swoopyarrow__arrowhead)');

    return pathNode;
  },

  _calcBezierControlPoints: function (firstPoint, lastPoint, factor) {
    const xDiff = Math.abs(lastPoint.lng - firstPoint.lng);
    const x1 = firstPoint.lng + xDiff / 2;
    const y1 = lastPoint.lat + xDiff / factor;
    return ([y1, x1]);
  },

  update: function () {
    const swoopyPath = this._createPath();

    return this;
  }
})

function swoopyArrow(options) {
  return new L.SwoopyArrow(options);
}

swoopyArrow({
  fromLatlng: [52.52, 13.4],
  toLatlng: [52.525, 14.405]
}).addTo(map)