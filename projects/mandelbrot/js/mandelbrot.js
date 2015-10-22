var mandelbrot = function () {

    var _options;
    var _canvas;
    var _context;
    var _canvasData;
    var _scaleX;
    var _scaleY;
    var _offsetX;
    var _offsetY;

    initialize = function (options) {
        _options = options;

        _canvas = document.getElementById(_options.canvasId);
        _context = _canvas.getContext('2d');
        _context.fillStyle = 'rgb(0,0,0)';
        _context.fillRect(0, 0, _canvas.width, _canvas.height);

        // canvasData is a bit like a writeable bitmap in WPF
        // or a handle on that chunk of memory
        _canvasData = _context.getImageData(0, 0, _canvas.width, _canvas.height);

        // cartesian system is -2 to 2, or 4 units each axis
        // 2x2 as that's where the interesting stuff is in mandelbrot set
        _scaleX = _canvas.width / 4; // this many pixels per unit
        _scaleY = _canvas.width / 4;
        _offsetX = _scaleX * 2;
        _offsetY = _scaleY * 2;
    };

    // main render loop
    render = function () {
        for (var x = -2; x < 2; x = x + 0.01) {
            for (var y = -2; y < 2; y = y + 0.01) {
                if (isInSet(x, y)) {
                    setPoint(x, y);
                }
            }
        }
        // then we update it in one hit like bitblit?
        _context.putImageData(_canvasData, 0, 0);
    };

    // determine if this point is in the set
    isInSet = function (x, y) {
        // series is z(n+1) => z(n)^2 + c
        // where z starts at zero
        // and c is a complex number
        // and n goes from 0 to say 100
        // if the number exceeds some threshold (4) then we say it out of the set

        var z = new complexNumber(0, 0);
        var c = new complexNumber(x, y);

        for (var n = 0; n < 50; n++) {
            z = z.multiply(z).add(c);
        }

        return (z.conjugate().r < 4);
    }

    setPoint = function (x, y) {
        var index = cartesianToPixelIndex(x, y);
        setCanvasIndex(index);
    };

    cartesianToPixelIndex = function (x, y) {
        x = Math.floor(x * _scaleX + _offsetX);
        y = Math.floor(y * _scaleY + _offsetY);

        // the bitmap is like a vector in memory, each point takes 32 bits (RGBA) or 4 bytes
        // to represent the colour depth and alpha
        // _canvas.width is like stride
        // multiply by four to account for the colour depth
        // a four pixel canvas might look like
        // [rgbargbargbargba]
        return (x + (y * _canvas.width)) * 4;
    };

    setCanvasIndex = function (index) {
        // set this pixel white
        _canvasData.data[index + 0] = 255; //r
        _canvasData.data[index + 1] = 255; //g
        _canvasData.data[index + 2] = 255; //b
        _canvasData.data[index + 3] = 255; //a
    };

    return {
        init: initialize,
        render: render
    };
} ();

// on ready fire her up!
$(function () {
    mandelbrot.init({ canvasId: "canvas1" });
    mandelbrot.render();
});





