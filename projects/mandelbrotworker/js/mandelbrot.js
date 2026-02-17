var mandelbrot = function () {
    "use strict"

    var _options;
    var _canvas;
    var _context;

    var _worker1;
    var _worker2;
    var _worker3;
    var _worker4;

    var initialize = function (options) {
        _options = options;
        _canvas = document.getElementById(_options.canvasId);
        _context = _canvas.getContext('2d');

        _worker1 = new Worker('js/mandelbrot-worker.js');
        _worker2 = new Worker('js/mandelbrot-worker.js');
        _worker3 = new Worker('js/mandelbrot-worker.js');
        _worker4 = new Worker('js/mandelbrot-worker.js');

        // callback
        // workers are operating over four quadrants
        _worker1.addEventListener('message', function (event) {
            var message = event.data;
            _context.putImageData(event.data.canvasData, 0, 0);
            var d2 = new Date();
            console.log("w1", d2.getTime() - d1.getTime());
        }, false);

        _worker2.addEventListener('message', function (event) {
            var message = event.data;
            _context.putImageData(event.data.canvasData, _canvas.width / 2.0, 0);
            var d2 = new Date();
            console.log("w2", d2.getTime() - d1.getTime());
        }, false);

        _worker3.addEventListener('message', function (event) {
            var message = event.data;
            _context.putImageData(event.data.canvasData, 0, _canvas.height / 2.0);
            var d2 = new Date();
            console.log("w3", d2.getTime() - d1.getTime());
        }, false);

        _worker4.addEventListener('message', function (event) {
            var message = event.data;
            _context.putImageData(event.data.canvasData, _canvas.width / 2.0, _canvas.height / 2.0);
            var d2 = new Date();
            console.log("w4", d2.getTime() - d1.getTime());
        }, false);
    };

    var render = function () {
        d1 = new Date();

        // two slices, full width, half height each
        var height = _canvas.height / 2.0;
        var width = _canvas.width / 2.0;
        var ry = 150 / _options.zoom;
        var rx = 200 / _options.zoom;

        var origin1 = { x: _options.origin.x - (1 * rx), y: _options.origin.y + (1 * ry) };
        var origin2 = { x: _options.origin.x + (1 * rx), y: _options.origin.y + (1 * ry) };
        var origin3 = { x: _options.origin.x - (1 * rx), y: _options.origin.y - (1 * ry) };
        var origin4 = { x: _options.origin.x + (1 * rx), y: _options.origin.y - (1 * ry) };

        // invoke
        _worker1.postMessage({ canvasData: _context.getImageData(0, 0, width, height),
            options: { width: width, height: height, origin: origin1, zoom: _options.zoom }
        });

        _worker2.postMessage({ canvasData: _context.getImageData(width, 0, width, height),
            options: { width: width, height: height, origin: origin2, zoom: _options.zoom }
        });

        _worker3.postMessage({ canvasData: _context.getImageData(0, height, width, height),
            options: { width: width, height: height, origin: origin3, zoom: _options.zoom }
        });

        _worker4.postMessage({ canvasData: _context.getImageData(width, height, width, height),
            options: { width: width, height: height, origin: origin4, zoom: _options.zoom }
        });

    };

    var setZoom = function (z) {
        _options.zoom = parseFloat(z);
    };

    var setOrigin = function (x, y) {
        _options.origin.x = parseFloat(x);
        _options.origin.y = parseFloat(y);
    };

    return {
        init: initialize,
        render: render,
        setZoom: setZoom,
        setOrigin: setOrigin
    };
} ();

var d1 = new Date();

// on ready fire her up!
$(function () {

    mandelbrot.init({ canvasId: "canvas1", origin: { x: -1, y: 0 }, zoom: 200 });
    mandelbrot.render();

    $('#renderButton').click(function () {
        mandelbrot.setZoom($('#zoom').val());
        mandelbrot.setOrigin($('#x').val(), $('#y').val());
        mandelbrot.render();
    });
});



