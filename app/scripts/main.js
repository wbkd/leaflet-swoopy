const TurfBezier = require('turf-bezier');
const L = require('leaflet');
const curve = require('leaflet-curve');
const shortid = require('shortid');
const turf = require('turf');
const turfRotate = require('@turf/transform-rotate');

const map = L.map('map', {
  renderer: L.svg()
}).setView([52.52, 13.4], 5);

L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.SwoopyArrow = L.Layer.extend({
  options: {
    fromLatlng: [],
    toLatlng: [],
    htmlLabel: '',
    color: 'black',
    labelClass: '',
    opacity: 1,
    minZoom: 0,
    maxZoom: 22
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);

    this._currentPathVisible = true;
    this._fromLatlng = L.latLng(this.options.fromLatlng);
    this._toLatlng = L.latLng(this.options.toLatlng);
    this._controlLatlng = L.latLng(this._getControlPoint(L.latLng(this.options.fromLatlng), L.latLng(this.options.toLatlng)));
    this._htmlLabel = this.options.htmlLabel;
    this._color = this.options.color;
    this._labelClass = this.options.labelClass;
    this._opacity = this.options.opacity;
    this._minZoom = this.options.minZoom;
    this._maxZoom = this.options.maxZoom;

    this._initSVG();
  },

  _initSVG: function () {
    this._svg = L.SVG.create('svg');
    this._currentId = shortid.generate();

    this._arrow = this._createArrow();
    this._svg.appendChild(this._arrow);
  },

  onAdd: function (map) {
    this._map = map;
    this.getPane().appendChild(this._svg);
    this._drawSwoopyArrows();

    this.update();
  },

  getEvents: function () {
    return {
      zoom: this.update,
      viewreset: this.update
    };
  },

  _drawSwoopyArrows: function() {
    const swoopyPath = this._createPath();
    this._currentPath = swoopyPath._path;

    const swoopyLabel = this._createLabel();
    this._currentMarker = L.marker([this._fromLatlng.lat, this._fromLatlng.lng], { icon: swoopyLabel }).addTo( this._map);
  },

  _createArrow: function () {
    this._container = this._container || L.SVG.create('defs');
    const marker = L.SVG.create('marker');
    const path = L.SVG.create('polyline');

    marker.setAttribute('id', `swoopyarrow__arrowhead${this._currentId}`);
    L.DomUtil.addClass(marker, 'swoopyArrow__marker');
    marker.setAttribute('markerWidth', '20');
    marker.setAttribute('markerHeight', '20');
    marker.setAttribute('viewBox', '-10 -10 20 20');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('refX', '0');
    marker.setAttribute('refY', '0');
    marker.setAttribute('fill', 'none');
    marker.setAttribute('stroke', this._color);
    marker.setAttribute('stroke-width', 1);
    marker.setAttribute('opacity', this._opacity);

    path.setAttribute('stroke-linejoin', 'bevel');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', this._color);
    path.setAttribute('points', '-6.75,-6.75 0,0 -6.75,6.75');

    marker.appendChild(path);
    this._container.appendChild(marker);

    return this._container;
  },

  _createPath: function () {
    const pathOne = L.curve(
      [
        'M', [this._fromLatlng.lat, this._fromLatlng.lng],
        'Q', [this._controlLatlng.lat, this._controlLatlng.lng], [this._toLatlng.lat, this._toLatlng.lng]

      ], {
        animate: false,
        color: this._color,
        fill: false,
        opacity: this._opacity,
        weight: 1,
        className: 'swoopyarrow__path'
      }
    ).addTo(map);

    pathOne._path.setAttribute('id', `swoopyarrow__path${this._currentId}`);
    pathOne._path.setAttribute('marker-end', `url(#swoopyarrow__arrowhead${this._currentId})`);

    return pathOne;
  },



  _getControlPoint: function (start, end) {

    const features = turf.featureCollection([
      turf.point( [start.lat, start.lng]),
      turf.point( [end.lat, end.lng])
    ]);

    const center = turf.center(features);

    // get pixel coordinates for start, end and center
    const startPx = map.latLngToContainerPoint(start);
    const centerPx = map.latLngToContainerPoint(L.latLng(center.geometry.coordinates[0], center.geometry.coordinates[1]));

    const newCoord = rotatePoint(centerPx, startPx, 90);
    const point = L.point(newCoord.x, newCoord.y);

    return map.containerPointToLatLng(point);
  },


  _createLabel: function() {
    return L.divIcon({
      className: this._labelClass,
      html: this._htmlLabel,
      iconAnchor: [this._fromLatlng.lat, this._fromLatlng.lng],
      iconSize: 'auto'
    });
  },

  update: function () {
    this._currentMarker = this._createLabel();
    
    L.circle([this._controlLatlng.lat, this._controlLatlng.lng], {radius: 200}).addTo(this._map);
    L.marker([this._fromLatlng.lat, this._fromLatlng.lng], { icon: this._currentMarker }).addTo( this._map);
    return this;
  },

  _checkZoomLevel: function() {
    const currentZoomLevel = this._map.getZoom();

    if(!this._currentPathVisible) {
      this._currentPath.setAttribute('opacity', this._opacity);
      this._currentMarker.setOpacity(this._opacity);
    }

    if(currentZoomLevel < this._minZoom || currentZoomLevel > this._maxZoom) {
      this._currentPath.setAttribute('opacity', 0);
      this._currentMarker.setOpacity(0);

      this._currentPathVisible = false;
    }
  }

})

function swoopyArrow(options) {
  return new L.SwoopyArrow(options);
}

swoopyArrow({
  fromLatlng: [60.52, 1.4],
  toLatlng: [52.52, 30.405],
  htmlLabel: '<h2>From A to B</h2>',
  color: 'red',
  labelClass: 'my-custom-class',
  opacity: .62,
  minZoom: 7,
  maxZoom: 11
}).addTo(map)


function rotatePoint(origin, point, angle) {
  const radians = angle * Math.PI / 180.0;

  return {
    x: Math.cos(radians) * (point.x - origin.x) - Math.sin(radians) * (point.y - origin.y) + origin.x,
    y: Math.sin(radians) * (point.x - origin.x) + Math.cos(radians) * (point.y - origin.y) + origin.y
  };
}


swoopyArrow({
  fromLatlng: [53.52, 13.4],
  toLatlng: [53.525, 14.405],
  htmlLabel: 'From C to D'
}).addTo(map)
