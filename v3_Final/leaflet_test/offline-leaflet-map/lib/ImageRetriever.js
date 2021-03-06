var ImageRetriever, ajax, arrayBufferToBase64ImagePNG;

module.exports = ImageRetriever = (function() {
  function ImageRetriever(offlineLayer) {
    this.offlineLayer = offlineLayer;
  }

  ImageRetriever.prototype.retrieveImage = function(tileInfo, callback, error) {
    var imageUrl;
    imageUrl = this.offlineLayer._createURL(tileInfo.x, tileInfo.y, tileInfo.z);
    return ajax(imageUrl, function(response) {
      return callback(arrayBufferToBase64ImagePNG(response));
    }, error);
  };

  return ImageRetriever;

})();


/*
 The MIT License (MIT)

 Copyright (c) <year> <copyright holders>

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

ajax = function(url, callback, error, queueCallback) {
  var xhr;
  xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(err) {
    if (this.status === 200) {
      return callback(this.response);
    } else {
      return error("GET_STATUS_ERROR", err);
    }
  };
  xhr.onerror = function(errorMsg) {
    return error("NETWORK_ERROR", errorMsg);
  };
  return xhr.send();
};


/*
Probably btoa can work incorrect, you can override btoa with next example:
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Base64_encoding_and_decoding#Solution_.232_.E2.80.93_rewriting_atob%28%29_and_btoa%28%29_using_TypedArrays_and_UTF-8
 */

arrayBufferToBase64ImagePNG = function(buffer) {
  var binary, bytes, i, _i, _ref;
  binary = '';
  bytes = new Uint8Array(buffer);
  for (i = _i = 0, _ref = bytes.byteLength; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:image/png;base64,' + btoa(binary);
};
