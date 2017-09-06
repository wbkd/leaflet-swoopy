(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('leaflet'), require('@turf/helpers'), require('@turf/center')) :
	typeof define === 'function' && define.amd ? define(['leaflet', '@turf/helpers', '@turf/center'], factory) :
	(factory(global.L));
}(this, (function (L$1) { 'use strict';

L$1 = L$1 && L$1.hasOwnProperty('default') ? L$1['default'] : L$1;

/*
 * Leaflet.curve v0.1.0 - a plugin for Leaflet mapping library. https://github.com/elfalem/Leaflet.curve
 * (c) elfalem 2015
 */
/*
 * note that SVG (x, y) corresponds to (long, lat)
 */

L.Curve = L.Path.extend({
	options: {
	},
	
	initialize: function(path, options){
		L.setOptions(this, options);
		this._setPath(path);
	},
	
	getPath: function(){
		return this._coords;
	},
	
	setPath: function(path){
		this._setPath(path);
		return this.redraw();
	},
	
	getBounds: function() {
		return this._bounds;
	},

	_setPath: function(path){
		this._coords = path;
		this._bounds = this._computeBounds();
	},
	
	_computeBounds: function(){
		var bound = new L.LatLngBounds();
		var lastPoint;
		var lastCommand;
		for(var i = 0; i < this._coords.length; i++){
			coord = this._coords[i];
			if(typeof coord == 'string' || coord instanceof String){
				lastCommand = coord;
			}else if(lastCommand == 'H'){
				bound.extend([lastPoint.lat,coord[0]]);
				lastPoint = new L.latLng(lastPoint.lat,coord[0]);
			}else if(lastCommand == 'V'){
				bound.extend([coord[0], lastPoint.lng]);
				lastPoint = new L.latLng(coord[0], lastPoint.lng);
			}else if(lastCommand == 'C'){
				var controlPoint1 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var controlPoint2 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var endPoint = new L.latLng(coord[0], coord[1]);

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			}else if(lastCommand == 'S'){
				var controlPoint2 = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var endPoint = new L.latLng(coord[0], coord[1]);

				var controlPoint1 = lastPoint;
				if(lastPoint.controlPoint2){
					var diffLat = lastPoint.lat - lastPoint.controlPoint2.lat;
					var diffLng = lastPoint.lng - lastPoint.controlPoint2.lng;
					controlPoint1 = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint1);
				bound.extend(controlPoint2);
				bound.extend(endPoint);

				endPoint.controlPoint1 = controlPoint1;
				endPoint.controlPoint2 = controlPoint2;
				lastPoint = endPoint;
			}else if(lastCommand == 'Q'){
				var controlPoint = new L.latLng(coord[0], coord[1]);
				coord = this._coords[++i];
				var endPoint = new L.latLng(coord[0], coord[1]);

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			}else if(lastCommand == 'T'){
				var endPoint = new L.latLng(coord[0], coord[1]);

				var controlPoint = lastPoint;
				if(lastPoint.controlPoint){
					var diffLat = lastPoint.lat - lastPoint.controlPoint.lat;
					var diffLng = lastPoint.lng - lastPoint.controlPoint.lng;
					controlPoint = new L.latLng(lastPoint.lat + diffLat, lastPoint.lng + diffLng);
				}

				bound.extend(controlPoint);
				bound.extend(endPoint);

				endPoint.controlPoint = controlPoint;
				lastPoint = endPoint;
			}else{
				bound.extend(coord);
				lastPoint = new L.latLng(coord[0], coord[1]);
			}
		}
		return bound;
	},
	
	//TODO: use a centroid algorithm instead
	getCenter: function () {
		return this._bounds.getCenter();
	},
	
	_update: function(){
		if (!this._map) { return; }
		
		this._updatePath();
	},
	
	_updatePath: function() {
		this._renderer._updatecurve(this);
	},

	_project: function() {
		var coord, lastCoord, curCommand, curPoint;

		this._points = [];
		
		for(var i = 0; i < this._coords.length; i++){
			coord = this._coords[i];
			if(typeof coord == 'string' || coord instanceof String){
				this._points.push(coord);
				curCommand = coord;
			}else {
				switch(coord.length){
					case 2:
						curPoint = this._map.latLngToLayerPoint(coord);
						lastCoord = coord;
					break;
					case 1:
						if(curCommand == 'H'){
							curPoint = this._map.latLngToLayerPoint([lastCoord[0], coord[0]]);
							lastCoord = [lastCoord[0], coord[0]];
						}else{
							curPoint = this._map.latLngToLayerPoint([coord[0], lastCoord[1]]);
							lastCoord = [coord[0], lastCoord[1]];
						}
					break;
				}
				this._points.push(curPoint);
			}
		}
	}	
});

L.curve = function (path, options){
	return new L.Curve(path, options);
};

L.SVG.include({
	_updatecurve: function(layer){
		this._setPath(layer, this._curvePointsToPath(layer._points));
    	},
 	_curvePointsToPath: function(points){
		var point, curCommand, str = '';
		for(var i = 0; i < points.length; i++){
			point = points[i];
			if(typeof point == 'string' || point instanceof String){
				curCommand = point;
				str += curCommand;
			}else{
				switch(curCommand){
					case 'H':
						str += point.x + ' ';
						break;
					case 'V':
						str += point.y + ' ';
						break;
					default:
						str += point.x + ',' + point.y + ' ';
						break;
				}
			}
		}
		return str || 'M0 0';
	}
});

'use strict';
module.exports = require('./lib/index');

L$1.SwoopyArrow = L$1.Layer.extend({
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

  initialize: function initialize(options) {
    L$1.Util.setOptions(this, options);

    this._currentPathVisible = true;
    this._fromLatlng = L$1.latLng(this.options.fromLatlng);
    this._toLatlng = L$1.latLng(this.options.toLatlng);
    this._factor = this.options.factor;
    this._controlLatlng = L$1.latLng(this._getControlPoint(L$1.latLng(this.options.fromLatlng), L$1.latLng(this.options.toLatlng), this.options.factor));
    this._htmlLabel = this.options.htmlLabel;
    this._labelSize = this.options.labelSize;
    this._color = this.options.color;
    this._labelClass = this.options.labelClass;
    this._opacity = this.options.opacity;
    this._minZoom = this.options.minZoom;
    this._maxZoom = this.options.maxZoom;

    this._initSVG();
  },

  _initSVG: function _initSVG() {
    this._svg = L$1.SVG.create('svg');
    this._currentId = shortid.generate();

    this._arrow = this._createArrow();
    this._svg.appendChild(this._arrow);
  },

  onAdd: function onAdd(map) {
    this._map = map;
    this.getPane().appendChild(this._svg);

    this._drawSwoopyArrows();

    this.update(this._map);
  },

  getEvents: function getEvents() {
    return {
      zoom: this.update,
      viewreset: this.update
    };
  },

  _drawSwoopyArrows: function _drawSwoopyArrows() {
    var swoopyPath = this._createPath();
    this._currentPath = swoopyPath._path;

    var swoopyLabel = this._createLabel();
    this._currentMarker = L$1.marker([this._fromLatlng.lat, this._fromLatlng.lng], { icon: swoopyLabel }).addTo(this._map);
  },

  _createArrow: function _createArrow() {
    this._container = this._container || L$1.SVG.create('defs');
    var marker = L$1.SVG.create('marker');
    var path = L$1.SVG.create('polyline');

    marker.setAttribute('id', 'swoopyarrow__arrowhead' + this._currentId);
    L$1.DomUtil.addClass(marker, 'swoopyArrow__marker');
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

  _createPath: function _createPath() {
    var pathOne = L$1.curve(['M', [this._fromLatlng.lat, this._fromLatlng.lng], 'Q', [this._controlLatlng.lat, this._controlLatlng.lng], [this._toLatlng.lat, this._toLatlng.lng]], {
      animate: false,
      color: this._color,
      fill: false,
      opacity: this._opacity,
      weight: 1,
      className: 'swoopyarrow__path'
    }).addTo(map);

    pathOne._path.setAttribute('id', 'swoopyarrow__path' + this._currentId);
    pathOne._path.setAttribute('marker-end', 'url(#swoopyarrow__arrowhead' + this._currentId + ')');

    return pathOne;
  },

  _rotatePoint: function _rotatePoint(origin, point, angle) {
    var radians = angle * Math.PI / 180.0;

    return {
      x: Math.cos(radians) * (point.x - origin.x) - Math.sin(radians) * (point.y - origin.y) + origin.x,
      y: Math.sin(radians) * (point.x - origin.x) + Math.cos(radians) * (point.y - origin.y) + origin.y
    };
  },

  _getControlPoint: function _getControlPoint(start, end, factor) {
    var features = turf.featureCollection([turf.point([start.lat, start.lng]), turf.point([end.lat, end.lng])]);

    var center$$1 = turf.center(features);

    // get pixel coordinates for start, end and center
    var startPx = map.latLngToContainerPoint(start);
    var centerPx = map.latLngToContainerPoint(L$1.latLng(center$$1.geometry.coordinates[0], center$$1.geometry.coordinates[1]));
    var rotatedPx = this._rotatePoint(centerPx, startPx, 90);

    var distance = Math.sqrt(Math.pow(startPx.x - centerPx.x, 2) + Math.pow(startPx.y - centerPx.y, 2));
    var angle = Math.atan2(rotatedPx.y - centerPx.y, rotatedPx.x - centerPx.x);

    var offset = factor * distance - distance;

    var sin = Math.sin(angle) * offset;
    var cos = Math.cos(angle) * offset;

    var controlPoint = L$1.point(rotatedPx.x + cos, rotatedPx.y + sin);

    return map.containerPointToLatLng(controlPoint);
  },

  _createLabel: function _createLabel() {
    return L$1.divIcon({
      className: this._labelClass,
      html: '<span id="marker-label' + this._currentId + '" style="font-size: ' + this._map.getZoom() * this._labelSize + 'px">' + this._htmlLabel + '</span>',
      iconAnchor: [this._fromLatlng.lat, this._fromLatlng.lng],
      iconSize: 'auto'
    });
  },

  update: function update(map) {
    this._checkZoomLevel();

    var arrowHead = this._svg.getElementById('swoopyarrow__arrowhead' + this._currentId);
    arrowHead.setAttribute('markerWidth', '' + 2.5 * this._map.getZoom());
    arrowHead.setAttribute('markerHeight', '' + 2.5 * this._map.getZoom());

    var label = document.getElementById('marker-label' + this._currentId);
    label.setAttribute('style', 'font-size: ' + this._map.getZoom() * 0.2 * this._labelSize + 'px;');

    return this;
  },

  _checkZoomLevel: function _checkZoomLevel() {
    var currentZoomLevel = this._map.getZoom();

    if (!this._currentPathVisible) {
      this._currentPath.setAttribute('opacity', this._opacity);
      this._currentMarker.setOpacity(this._opacity);
    }

    if (currentZoomLevel < this._minZoom || currentZoomLevel > this._maxZoom) {
      this._currentPath.setAttribute('opacity', 0);
      this._currentMarker.setOpacity(0);

      this._currentPathVisible = false;
    }
  }
});

})));
//# sourceMappingURL=Leaflet.SwoopyArrow.js.map
