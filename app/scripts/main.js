
const swoopyArrowHelper = require('./swoopyArrow').default;
const TurfBezier = require('turf-bezier');
const L = require('leaflet');
const curve = require('leaflet-curve');


const map = L.map('map').setView([52.52, 13.4], 9);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.SwoopyArrow = L.Layer.extend({
  options: {
    fromLatlng: [],
    toLatlng: [],
  },

  initialize: function(options) {
    L.Util.setOptions(this, options);

    this._fromLatlng = L.latLng(this.options.fromLatlng);
    this._toLatlng = L.latLng(this.options.toLatlng);

    this._initSVG();
  },

  _initSVG: function() {
    this._svg = L.SVG.create('svg');
    this._path = L.SVG.create('path');

    L.DomUtil.addClass(this._svg, 'leaflet-swoopyarrow');
    L.DomUtil.addClass(this._path, 'leaflet-swoopyarrow__path');

    this._path.setAttribute('stroke', '#000');
    this._path.setAttribute('fill', 'none');
    this._path.setAttribute('marker-end', 'url(#arrowhead)');

    this._svg.appendChild(this._path);
  },

  onAdd: function(map) {
    this._map = map;
    this.getPane().appendChild(this._svg);

    this.update();
  },

  _getSwoopyPath: function(map) {
    return swoopyArrowHelper()
      .angle(Math.PI/4)
      .x(d => this._map.latLngToLayerPoint([d.lat, d.lng]).x)
      .y(d => this._map.latLngToLayerPoint([d.lat, d.lng]).y);
  },

  getEvents: function () {
		return {
			zoom: this.update,
			viewreset: this.update
		};
	},

  update: function() {
    const swoopyPath = this._getSwoopyPath()([this._fromLatlng,this._toLatlng]);
    this._path.setAttribute('d', swoopyPath);

    var pos = this._map.latLngToLayerPoint(this._fromLatlng).round();

    console.log(pos)

    const pathBBox = this._path.getBBox();

 //   L.DomUtil.setPosition(this._svg, L.point(pathBBox))
    this._svg.setAttribute('width', window.innerWidth);
    this._svg.setAttribute('height', window.innerHeight);

    return this;
  }
})

function swoopyArrow(options) {
  return new L.SwoopyArrow(options);
}

//  swoopyArrow({
//    fromLatlng: [52.52, 13.4],
//    toLatlng: [52.525, 14.405]
//  }).addTo(map)

var calcBezierControlPoints = function(firstPoint, lastPoint, factor) {
    var xDiff = Math.abs(lastPoint.x - firstPoint.x);
    var x1 = firstPoint.x + xDiff / 2;
    var y1 = lastPoint.y + xDiff / factor;
    return ([y1, x1]);
}

//quadratic bezier curve
var curvePoint = calcBezierControlPoints({y: 52.4, x: 13.4}, {y:52.525, x:14.405}, 8);

var pathOne = L.curve(
  [
   'M', [52.4, 13.4],
   'Q', curvePoint,
       [52.525, 14.405]
  ], {animate: false, color:'red', fill:false}
).addTo(map);
                

             
