const TurfBezier = require('turf-bezier');
const L = require('leaflet');
const curve = require('leaflet-curve');
const shortid = require('shortid');

const map = L.map('map').setView([52.52, 13.4], 9);

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
    //quadratic bezier curve
    const curvePoint = this._calcBezierControlPoints(this._fromLatlng, this._toLatlng, 8);

    const pathOne = L.curve(
      [
        'M', [this._fromLatlng.lat, this._fromLatlng.lng],
        'Q', curvePoint, [this._toLatlng.lat, this._toLatlng.lng]

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

  _calcBezierControlPoints: function (firstPoint, lastPoint, factor) {
    const xDiff = Math.abs(lastPoint.lng - firstPoint.lng);
    const x1 = firstPoint.lng + xDiff / 2;
    const y1 = lastPoint.lat + xDiff / factor;
    return ([y1, x1]);
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
    this._checkZoomLevel();
    
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
  fromLatlng: [52.52, 13.4],
  toLatlng: [52.525, 14.405],
  htmlLabel: '<div>From A to B</div>',
  color: 'red',
  labelClass: 'my-custom-class',
  opacity: .62,
  minZoom: 7,
  maxZoom: 11
}).addTo(map)

swoopyArrow({
  fromLatlng: [53.52, 13.4],
  toLatlng: [53.525, 14.405],
  htmlLabel: 'From C to D'
}).addTo(map)