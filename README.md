# :arrow_heading_down: Leaflet Swoopy Arrow Plugin

You can find the docs on the plugin [website](https://wbkd.github.io/leaflet-swoopy/).

![swoopy screenshot](/docs/leaflet-swoopy-screenshot.png?raw=true)


## Installation

You need [Leaflet](http://leafletjs.com/) in order to run this plugin.

Install with npm/yarn:
```shell
$ npm install leaflet-swoopy
```

Or download the minified library from [unpkg](https://unpkg.com/leaflet-swoopy/build/Leaflet.SwoopyArrow.min.js) or [jsDelivr](https://cdn.jsdelivr.net/npm/leaflet-swoopy)
```shell
<script src="https://unpkg.com/leaflet-swoopy"></script>
```

## Usage

```javascript
import L from 'leaflet';
import 'leaflet-swoopy';

// create leaflet map ...

const swoopy = L.swoopyArrow([53.52, 13.4], [53.525, 14.41], {
  annotation: 'Hi!',
  fontSize: 12,
  iconAnchor: [20, 10],
  iconSize: [20, 16]
}).addTo(map);
```
