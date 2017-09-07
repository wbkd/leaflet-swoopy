import L from 'leaflet';
import '@webk1d/leaflet-curve';
import turf from '@turf/helpers';
import turfCenter from '@turf/center';

L.SwoopyArrow = L.Layer.extend({
  options: {
    fromLatlng: [],
    toLatlng: [],
    htmlLabel: '',
    color: 'black',
    labelClass: '',
    opacity: 1,
    minZoom: 0,
    maxZoom: 22,
    factor: 0
  },

  initialize: function (options) {
    L.Util.setOptions(this, options);

    this._currentPathVisible = true;
    this._fromLatlng = L.latLng(this.options.fromLatlng);
    this._toLatlng = L.latLng(this.options.toLatlng);
    this._factor = this.options.factor;
    this._controlLatlng = L.latLng(this._getControlPoint(L.latLng(this.options.fromLatlng), L.latLng(this.options.toLatlng), this.options.factor));
    this._htmlLabel = this.options.htmlLabel;
    this._labelSize = this.options.labelSize;
    this._color = this.options.color;
    this._labelClass = this.options.labelClass;
    this._opacity = this.options.opacity;
    this._minZoom = this.options.minZoom;
    this._maxZoom = this.options.maxZoom;

    this._initSVG();
  },

  _initSVG: function () {
    this._svg = L.SVG.create('svg');
    this._currentId = new Date().getUTCMilliseconds();

    this._arrow = this._createArrow();
    this._svg.appendChild(this._arrow);
  },

  onAdd: function (map) {
    this._map = map;
    this.getPane().appendChild(this._svg);

    this._drawSwoopyArrows();

    this.update(this._map);
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


  _rotatePoint: function (origin, point, angle) {
    const radians = angle * Math.PI / 180.0;

    return {
      x: Math.cos(radians) * (point.x - origin.x) - Math.sin(radians) * (point.y - origin.y) + origin.x,
      y: Math.sin(radians) * (point.x - origin.x) + Math.cos(radians) * (point.y - origin.y) + origin.y
    };
  },

  _getControlPoint: function (start, end, factor) {
    const features = turf.featureCollection([
      turf.point( [start.lat, start.lng]),
      turf.point( [end.lat, end.lng])
    ]);

    const center = turfCenter(features);

    // get pixel coordinates for start, end and center
    const startPx = map.latLngToContainerPoint(start);
    const centerPx = map.latLngToContainerPoint(L.latLng(center.geometry.coordinates[0], center.geometry.coordinates[1]));
    const rotatedPx = this._rotatePoint(centerPx, startPx, 90);


    const distance = Math.sqrt(Math.pow(startPx.x - centerPx.x, 2) + Math.pow(startPx.y - centerPx.y, 2));
    const angle = Math.atan2(rotatedPx.y - centerPx.y, rotatedPx.x - centerPx.x);


    const offset = (factor * distance) - distance;

    const sin = Math.sin(angle) * offset;
    const cos = Math.cos(angle) * offset;

    const controlPoint = L.point(rotatedPx.x + cos, rotatedPx.y + sin);

    return map.containerPointToLatLng(controlPoint);
  },

  _createLabel: function() {
    return L.divIcon({
      className: this._labelClass,
      html: `<span id="marker-label${this._currentId}" style="font-size: ${this._map.getZoom() * this._labelSize}px">${this._htmlLabel}</span>`,
      iconAnchor: [this._fromLatlng.lat, this._fromLatlng.lng],
      iconSize: 'auto'
    });
  },

  update: function (map) {
    this._checkZoomLevel();

    const arrowHead = this._svg.getElementById(`swoopyarrow__arrowhead${this._currentId}`);
    arrowHead.setAttribute('markerWidth', `${2.5 * this._map.getZoom()}`);
    arrowHead.setAttribute('markerHeight', `${2.5 * this._map.getZoom()}`);

    const label = document.getElementById(`marker-label${this._currentId}`);
    label.setAttribute('style', `font-size: ${this._map.getZoom() * 0.2 * this._labelSize}px;`);

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
