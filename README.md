# 🍃 Leaflet Swoopy Arrow Plugin

You can find the docs on the plugin [website](https://wbkd.github.io/leaflet-swoopy/).

![swoopy screenshot](/docs/leaflet-swoopy-screenshot.png?raw=true)


## Installation

Install all dependencies running:

```shell
$ npm install leaflet-swoopy
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
