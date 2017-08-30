# Starterkit

This webapp starterkit provides a prepared development environment based on [gulp](https://github.com/gulpjs/gulp), [stylus](https://github.com/LearnBoost/stylus) and [webpack](https://github.com/webpack/webpack).

## Installation

Install all dependencies. 

```
$ npm install
```


## Development

Builds the application and starts a webserver with livereload. By default the webserver starts at port 3000.

```
$ gulp
```

Javascript entry file: `app/scripts/main.js` <br />
CSS entry file: `app/stylus/main.styl`<br />

If you want to use third-party CSS you just include it via `@import 'path/to/your/third-party-styles.css'` at the top of the main.styl file.



## Build

Builds a minified version of the application in the dist folder.

```
$ gulp build --type production
```



###Requirements
* node
* npm
* gulp