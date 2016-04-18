importScripts('http://benmcevoy.com.au/projects/mandelbrotworker/js/complexNumber.js');

var _canvasData;
var _options;
var _offsetX;
var _offsetY;
var _maxIterations = 100;

render = function (width, height) {
    var dx = width / _options.zoom / 2.0;
    var dy = height / _options.zoom / 2.0;
    var x0 = _options.origin.x - dx;
    var x1 = _options.origin.x + dx;
    var y0 = -_options.origin.y - dy;
    var y1 = -_options.origin.y + dy;
    var step = 1 / _options.zoom;

    _offsetX = Math.abs(x0) * _options.zoom;
    _offsetY = Math.abs(y0) * _options.zoom;

    for (var x = x0; x < x1; x = x + step) {
        for (var y = y0; y < y1; y = y + step) {
            setInSet(x, y);
        }
    }

    self.postMessage({ canvasData: _canvasData, x: 0, y: 0 });
};

// determine if this point is in the set
setInSet = function (x, y) {
    // series is z(n+1) => z(n)^2 + c
    // where z starts at zero
    // and c is a complex number
    // and n goes from 0 to say 100
    // if the number exceeds some threshold (4) then we say it out of the set
    var z = new complexNumber(0, 0);
    var c = new complexNumber(x, y);

    for (var n = 0; n < _maxIterations; n++) {
        z = z.multiply(z).add(c);
        if (z.r > 4) {
            break;
        }
    }

    setPoint(x, y, n);
}

setPoint = function (x, y, n) {
    var index = cartesianToPixelIndex(x, y);
    setCanvasIndex(index, n);
};

cartesianToPixelIndex = function (x, y) {
    x = Math.round(x * _options.zoom) + _offsetX;
    y = Math.round(y * _options.zoom) + _offsetY;

    // the bitmap is like a vector in memory, each point takes 32 bits (RGBA) or 4 bytes
    // to represent the colour depth and alpha
    // _canvas.width is like stride
    // multiply by four to account for the colour depth
    // a four pixel canvas might look like
    // [rgbargbargbargba]
    return (x + (y * _options.width)) * 4;
};

setCanvasIndex = function (index, n) {
    var c = getColor(n);

    _canvasData.data[index + 0] = c.r;
    _canvasData.data[index + 1] = c.g;
    _canvasData.data[index + 2] = c.b;
    _canvasData.data[index + 3] = 255; //a
};

getColor = function (n) {
    if (n >= _maxIterations) n = 0;

    n = Math.abs(n * (255 / _maxIterations));

    return { r: n, g: n, b: n };
}

onmessage = function (event) {
    _canvasData = event.data.canvasData;
    _options = event.data.options;

    render(_options.width, _options.height);
};