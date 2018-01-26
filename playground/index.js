const Playground = {
  init(_config = {}) {
    this._container = document.querySelector(_config.containerId);

    this._map = this.mountMap(this._container);
    this._plugin = this.mountPlugin(this._map, _config.data, _config.options);
    this.addButtonHandler(this._container, this._map, this._plugin);
  },

  mountMap(_container) {
    const mapNode = _container.querySelector('.map');

    const map = L.map(mapNode, {
      center: [53, 13.4],
      zoom: 5,
      zoomControl: false,
      zoomDelta: .25,
      zoomSnap: .25
    });

    new L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png', {
      attribution: `attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attribution">CARTO</a>`,
      detectRetina: true
    }).addTo(map);

    return map;
  },

  mountPlugin(_map, _data, _options) {
    return new L.SwoopyArrow(_data[0], _data[1], _options).addTo(_map);
  },

  addButtonHandler(_container, _map, _plugin) {
    const removeBtn = _container.querySelector('.remove');
    removeBtn.addEventListener('click', () => _map.removeLayer(_plugin));
  },
}

const data = [[52.316365, 24.637743], [50.000512, 16.604392]];

const options = {
  label: 'Hi!',
  labelFontSize: 16,
  labelColor: '#64A7D9',
  color: '#64A7D9',
  labelClassName: 'swoopy-arrow',
  arrowFilled: true,
  opacity: 1,
  minZoom: 2,
  maxZoom: 10,
  factor: .6,
  iconAnchor: [0, 20],
  iconSize: [90, 16],
  weight: 2
};

Playground.init({containerId: '#map1', data, options});