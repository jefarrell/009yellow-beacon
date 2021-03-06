var ImageRetriever, ImageStore, OfflineLayer,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

ImageStore = require('./ImageStore');

ImageRetriever = require('./ImageRetriever');

module.exports = OfflineLayer = (function(_super) {
  __extends(OfflineLayer, _super);

  function OfflineLayer() {
    return OfflineLayer.__super__.constructor.apply(this, arguments);
  }

  OfflineLayer.prototype.initialize = function(url, options) {
    var dbOption, err, imageRetriever, storeName, useWebSQL;
    L.TileLayer.prototype.initialize.call(this, url, options);
    this._alreadyReportedErrorForThisActions = false;
    this._onReady = options["onReady"];
    this._onError = options["onError"];
    dbOption = options["dbOption"];
    storeName = options["storeName"] || 'OfflineLeafletTileImages';
    this._tileImagesStore = null;
    this._minZoomLevel = 12;
    if (options["minZoomLevel"] != null) {
      this._minZoomLevel = parseInt(options["minZoomLevel"]);
    }
    if ((dbOption != null) && dbOption !== "None") {
      try {
        if (dbOption === "WebSQL") {
          useWebSQL = true;
        } else if (dbOption === "IndexedDB") {
          useWebSQL = false;
        } else {
          this._onError("COULD_NOT_CREATE_DB", "Invalid dbOption parameter: " + dbOption);
        }
        imageRetriever = new ImageRetriever(this);
        this._tileImagesStore = new ImageStore(this, imageRetriever);
        return this._tileImagesStore.createDB(storeName, (function(_this) {
          return function() {
            return _this._onReady();
          };
        })(this), (function(_this) {
          return function(error) {
            _this._tileImagesStore = null;
            _this._reportError("COULD_NOT_CREATE_DB", error);
            return setTimeout(function() {
              return _this._onReady();
            }, 0);
          };
        })(this), useWebSQL);
      } catch (_error) {
        err = _error;
        this._tileImagesStore = null;
        this._reportError("COULD_NOT_CREATE_DB", err);
        return setTimeout((function(_this) {
          return function() {
            return _this._onReady();
          };
        })(this), 0);
      }
    } else {
      return setTimeout((function(_this) {
        return function() {
          return _this._onReady();
        };
      })(this), 0);
    }
  };

  OfflineLayer.prototype._setUpTile = function(tile, key, value) {
    tile.src = value;
    return this.fire('tileloadstart', {
      tile: tile,
      url: tile.src
    });
  };

  OfflineLayer.prototype._reportError = function(errorType, errorData) {
    if (this._onError) {
      if (!this._alreadyReportedErrorForThisActions) {
        this._alreadyReportedErrorForThisActions = true;
        return this._onError(errorType, errorData);
      }
    }
  };

  OfflineLayer.prototype._loadTile = function(tile, tilePoint) {
    var key, onError, onSuccess;
    if (!this._tileImagesStore) {
      return L.TileLayer.prototype._loadTile.call(this, tile, tilePoint);
    }
    tile._layer = this;
    tile.onerror = this._tileOnError;
    this._adjustTilePoint(tilePoint);
    tile.onload = this._tileOnLoad;
    onSuccess = (function(_this) {
      return function(dbEntry) {
        if (dbEntry) {
          return _this._setUpTile(tile, key, dbEntry.image);
        } else {
          return _this._setUpTile(tile, key, _this.getTileUrl(tilePoint));
        }
      };
    })(this);
    onError = (function(_this) {
      return function() {
        _this._setUpTile(tile, key, _this.getTileUrl(tilePoint));
        return _this._reportError("DB_GET", key);
      };
    })(this);
    key = this._createTileKey(tilePoint.x, tilePoint.y, tilePoint.z);
    return this._tileImagesStore.get(key, onSuccess, onError);
  };

  OfflineLayer.prototype.useDB = function() {
    return this._tileImagesStore !== null;
  };

  OfflineLayer.prototype.cancel = function() {
    if (this._tileImagesStore != null) {
      return this._tileImagesStore.cancel();
    }
    return false;
  };

  OfflineLayer.prototype.clearTiles = function(onSuccess, onError) {
    if (!this.useDB()) {
      this._reportError("NO_DB", "No DB available");
      onError("No DB available");
      return;
    }
    if (this.isBusy()) {
      this._reportError("SYSTEM_BUSY", "System is busy.");
      onError("System is busy.");
      return;
    }
    return this._tileImagesStore.clear(onSuccess, (function(_this) {
      return function(error) {
        _this._reportError("COULD_NOT_CLEAR_DB", error);
        return onError(error);
      };
    })(this));
  };

  OfflineLayer.prototype.calculateNbTiles = function(zoomLevelLimit) {
    var count, key, tileImagesToQuery;
    if (this._map.getZoom() < this._minZoomLevel) {
      this._reportError("ZOOM_LEVEL_TOO_LOW");
      return -1;
    }
    count = 0;
    tileImagesToQuery = this._getTileImages(zoomLevelLimit);
    for (key in tileImagesToQuery) {
      count++;
    }
    return count;
  };

  OfflineLayer.prototype.isBusy = function() {
    if (this._tileImagesStore != null) {
      return this._tileImagesStore.isBusy();
    }
    return false;
  };

  OfflineLayer.prototype._getTileImages = function(zoomLevelLimit) {
    var arrayLength, bounds, i, j, map, maxX, maxY, minX, minY, point, roundedTileBounds, startingZoom, tileBounds, tileImagesToQuery, tileSize, tilesInScreen, x, y, _i, _j, _k, _ref, _ref1, _ref2, _ref3;
    zoomLevelLimit = zoomLevelLimit || this._map.getMaxZoom();
    tileImagesToQuery = {};
    map = this._map;
    startingZoom = map.getZoom();
    bounds = map.getPixelBounds();
    tileSize = this._getTileSize ? this._getTileSize() : this.getTileSize().x;
    roundedTileBounds = L.bounds(bounds.min.divideBy(tileSize)._floor(), bounds.max.divideBy(tileSize)._floor());
    tilesInScreen = [];
    for (j = _i = _ref = roundedTileBounds.min.y, _ref1 = roundedTileBounds.max.y; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; j = _ref <= _ref1 ? ++_i : --_i) {
      for (i = _j = _ref2 = roundedTileBounds.min.x, _ref3 = roundedTileBounds.max.x; _ref2 <= _ref3 ? _j <= _ref3 : _j >= _ref3; i = _ref2 <= _ref3 ? ++_j : --_j) {
        tilesInScreen.push(new L.Point(i, j));
      }
    }
    tileBounds = L.bounds(bounds.min.divideBy(tileSize), bounds.max.divideBy(tileSize));
    minY = tileBounds.min.y;
    maxY = tileBounds.max.y;
    minX = tileBounds.min.x;
    maxX = tileBounds.max.x;
    arrayLength = tilesInScreen.length;
    for (i = _k = 0; 0 <= arrayLength ? _k < arrayLength : _k > arrayLength; i = 0 <= arrayLength ? ++_k : --_k) {
      point = tilesInScreen[i];
      x = point.x;
      y = point.y;
      this._getZoomedInTiles(x, y, startingZoom, zoomLevelLimit, tileImagesToQuery, minY, maxY, minX, maxX);
      this._getZoomedOutTiles(x, y, startingZoom, 0, tileImagesToQuery, minY, maxY, minX, maxX);
    }
    return tileImagesToQuery;
  };

  OfflineLayer.prototype.saveTiles = function(zoomLevelLimit, onStarted, onSuccess, onError) {
    var tileImagesToQuery;
    this._alreadyReportedErrorForThisActions = false;
    if (!this._tileImagesStore) {
      this._reportError("NO_DB", "No DB available");
      onError("No DB available");
      return;
    }
    if (this.isBusy()) {
      this._reportError("SYSTEM_BUSY", "system is busy.");
      onError("system is busy.");
      return;
    }
    if (this._map.getZoom() < this._minZoomLevel) {
      this._reportError("ZOOM_LEVEL_TOO_LOW");
      onError("ZOOM_LEVEL_TOO_LOW");
      return;
    }
    tileImagesToQuery = this._getTileImages(zoomLevelLimit);
    return this._tileImagesStore.saveImages(tileImagesToQuery, onStarted, onSuccess, (function(_this) {
      return function(error) {
        _this._reportError("SAVING_TILES", error);
        return onError(error);
      };
    })(this));
  };

  OfflineLayer.prototype._getZoomedInTiles = function(x, y, currentZ, maxZ, tileImagesToQuery, minY, maxY, minX, maxX) {
    this._getTileImage(x, y, currentZ, tileImagesToQuery, minY, maxY, minX, maxX, true);
    if (currentZ < maxZ) {
      minY *= 2;
      maxY *= 2;
      minX *= 2;
      maxX *= 2;
      this._getZoomedInTiles(x * 2, y * 2, currentZ + 1, maxZ, tileImagesToQuery, minY, maxY, minX, maxX);
      this._getZoomedInTiles(x * 2 + 1, y * 2, currentZ + 1, maxZ, tileImagesToQuery, minY, maxY, minX, maxX);
      this._getZoomedInTiles(x * 2, y * 2 + 1, currentZ + 1, maxZ, tileImagesToQuery, minY, maxY, minX, maxX);
      return this._getZoomedInTiles(x * 2 + 1, y * 2 + 1, currentZ + 1, maxZ, tileImagesToQuery, minY, maxY, minX, maxX);
    }
  };

  OfflineLayer.prototype._getZoomedOutTiles = function(x, y, currentZ, finalZ, tileImagesToQuery, minY, maxY, minX, maxX) {
    this._getTileImage(x, y, currentZ, tileImagesToQuery, minY, maxY, minX, maxX, false);
    if (currentZ > finalZ) {
      minY /= 2;
      maxY /= 2;
      minX /= 2;
      maxX /= 2;
      return this._getZoomedOutTiles(Math.floor(x / 2), Math.floor(y / 2), currentZ - 1, finalZ, tileImagesToQuery, minY, maxY, minX, maxX);
    }
  };

  OfflineLayer.prototype._getTileImage = function(x, y, z, tileImagesToQuery, minY, maxY, minX, maxX) {
    var key;
    if (x < Math.floor(minX) || x > Math.floor(maxX) || y < Math.floor(minY) || y > Math.floor(maxY)) {
      return;
    }
    key = this._createTileKey(x, y, z);
    if (!tileImagesToQuery[key]) {
      return tileImagesToQuery[key] = {
        key: key,
        x: x,
        y: y,
        z: z
      };
    }
  };

  OfflineLayer.prototype._createNormalizedTilePoint = function(x, y, z) {
    var nbTilesAtZoomLevel;
    nbTilesAtZoomLevel = Math.pow(2, z);
    while (x > nbTilesAtZoomLevel) {
      x -= nbTilesAtZoomLevel;
    }
    while (x < 0) {
      x += nbTilesAtZoomLevel;
    }
    while (y > nbTilesAtZoomLevel) {
      y -= nbTilesAtZoomLevel;
    }
    while (y < 0) {
      y += nbTilesAtZoomLevel;
    }
    return {
      x: x,
      y: y,
      z: z
    };
  };

  OfflineLayer.prototype._createURL = function(x, y, z) {
    var tilePoint;
    tilePoint = this._createNormalizedTilePoint(x, y, z);
    return this.getTileUrl(tilePoint);
  };

  OfflineLayer.prototype._createTileKey = function(x, y, z) {
    var tilePoint;
    tilePoint = this._createNormalizedTilePoint(x, y, z);
    return tilePoint.x + ", " + tilePoint.y + ", " + tilePoint.z;
  };

  OfflineLayer.prototype.getTileUrl = function(coords) {
    var data, invertedY;
    data = {
      r: L.Browser.retina ? '@2x' : '',
      s: this._getSubdomain(coords),
      x: coords.x,
      y: coords.y,
      z: coords.z || this._getZoomForUrl()
    };
    if (this._map && !this._map.options.crs.infinite) {
      invertedY = this._globalTileRange.max.y - coords.y;
      if (this.options.tms) {
        data['y'] = invertedY;
      }
      data['-y'] = invertedY;
    }
    return L.Util.template(this._url, L.extend(data, this.options));
  };

  return OfflineLayer;

})(L.TileLayer);
