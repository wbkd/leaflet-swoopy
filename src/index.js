import L from 'leaflet';
import '@webk1d/leaflet-curve';
import turf from '@turf/helpers';
import turfCenter from '@turf/center';

let id = 0;

L.SwoopyArrow = L.Layer.extend({
  fromLatlng: [],
  toLatlng: [],
  options: {
    color: '#222222',
    weight: 1,
    opacity: 1,
    factor: 0.5,
    arrowFilled: false,
    arrowId: null,
    minZoom: 0,
    maxZoom: 22,
    label: '',
    labelClassName: '',
    labelFontSize: 12,
    labelColor: '#222222',
    html: '',
    iconAnchor: [0, 0],
    iconSize: [50, 20],
  },

  initialize: function (fromLatlng, toLatlng, options) {
    L.Util.setOptions(this, options);

    this._currentPathVisible = true;
    this._fromLatlng = L.latLng(fromLatlng);
    this._toLatlng = L.latLng(toLatlng);
    this._factor = this.options.factor;
    this._label = this.options.label;
    this._labelFontSize = this.options.labelFontSize;
    this._labelColor = this.options.labelColor;
    this._color = this.options.color;
    this._labelClassName = this.options.labelClassName;
    this._html = this.options.html;
    this._opacity = this.options.opacity;
    this._minZoom = this.options.minZoom;
    this._maxZoom = this.options.maxZoom;
    this._iconAnchor = this.options.iconAnchor;
    this._iconSize = this.options.iconSize;
    this._weight = this.options.weight;
    this._arrowFilled = this.options.arrowFilled;
    this._arrowId = this.options.arrowId;

    this._initSVG();
  },

  _initSVG: function () {
    this._svg = L.SVG.create('svg');
    this._currentId = id++;
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
    this._currentMarker = L.marker([this._fromLatlng.lat, this._fromLatlng.lng], { icon: swoopyLabel }).addTo(this._map);
  },

  _createArrow: function () {
    this._container = this._container || L.SVG.create('defs');
    const marker = L.SVG.create('marker');
    const path = L.SVG.create('polyline');

    marker.className = 'swoopyArrow__marker';
    marker.setAttribute('id', `swoopyarrow__arrowhead${this._currentId}`);
    marker.setAttribute('markerWidth', '6.75');
    marker.setAttribute('markerHeight', '6.75');
    marker.setAttribute('viewBox', '-10 -10 20 20');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('refX', '0');
    marker.setAttribute('refY', '0');
    marker.setAttribute('fill', 'none');
    marker.setAttribute('stroke', this._color);
    marker.setAttribute('stroke-width', this._weight);
    marker.setAttribute('opacity', this._opacity);

    path.setAttribute('stroke-linejoin', 'bevel');
    path.setAttribute('fill', this._arrowFilled ? this._color : 'none');
    path.setAttribute('stroke', this._color);
    path.setAttribute('points', '-6.75,-6.75 0,0 -6.75,6.75');
    marker.appendChild(path);

    this._container.appendChild(marker);

    return this._container;
  },

  _createPath: function () {
    const controlLatlng = this._getControlPoint(L.latLng(this._fromLatlng), L.latLng(this._toLatlng), this.options.factor);
    const pathOne = L.curve([
      'M', [this._fromLatlng.lat, this._fromLatlng.lng],
      'Q', [controlLatlng.lat, controlLatlng.lng], [this._toLatlng.lat, this._toLatlng.lng]
      ], {
        animate: false,
        color: this._color,
        fill: false,
        opacity: this._opacity,
        weight: this._weight,
        className: 'swoopyarrow__path'
      }
    ).addTo(this._map);


    pathOne._path.setAttribute('id', `swoopyarrow__path${this._currentId}`);
    pathOne._path.setAttribute('marker-end', !this._arrowId ?
      `url(#swoopyarrow__arrowhead${this._currentId})` :
      `url(${this._arrowId})`
     );

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
      turf.point([start.lat, start.lng]),
      turf.point([end.lat, end.lng])
    ]);

    const center = turfCenter(features);

    // get pixel coordinates for start, end and center
    const startPx = this._map.latLngToContainerPoint(start);
    const centerPx = this._map.latLngToContainerPoint(L.latLng(center.geometry.coordinates[0], center.geometry.coordinates[1]));
    const rotatedPx = this._rotatePoint(centerPx, startPx, 90);

    const distance = Math.sqrt(Math.pow(startPx.x - centerPx.x, 2) + Math.pow(startPx.y - centerPx.y, 2));
    const angle = Math.atan2(rotatedPx.y - centerPx.y, rotatedPx.x - centerPx.x);
    const offset = (factor * distance) - distance;

    const sin = Math.sin(angle) * offset;
    const cos = Math.cos(angle) * offset;

    const controlPoint = L.point(rotatedPx.x + cos, rotatedPx.y + sin);

    return this._map.containerPointToLatLng(controlPoint);
  },

  _createLabel: function() {
    return L.divIcon({
      className: this._html === '' && this._labelClassName,
      html: this._html === ''  ? `<span id="marker-label${this._currentId}" style="font-size: ${this._labelFontSize}px; color: ${this._labelColor}">${this._label}</span>` : this._html,
      iconAnchor: this._iconAnchor,
      iconSize: this._iconSize
    });
  },

  update: function(map) {
    this._checkZoomLevel();

    const arrowHead = this._svg.getElementById(`swoopyarrow__arrowhead${this._currentId}`);
    arrowHead.setAttribute('markerWidth', `${2.5 * this._map.getZoom()}`);
    arrowHead.setAttribute('markerHeight', `${2.5 * this._map.getZoom()}`);

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
  },

  onRemove: function(map) {
    this._map = map;
    this._currentPath.remove();
    this._map.removeLayer(this._currentMarker);
  }
});

L.swoopyArrow = (fromLatlng, toLatlng, options) => new L.SwoopyArrow(fromLatlng, toLatlng, options);
