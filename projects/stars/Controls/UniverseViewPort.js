
// requestAnimation Polyfill from http://paulirish.com/2011/requestanimationframe-for-smart-animating/
(function () {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
} ());

var UniverseViewPort = function (canvasContext) {
    this.vm = new UniverseViewModel();
    this.lastTick = new Date().getTime();
    this.updateTimerId;
    this.canvasContext = canvasContext.getContext('2d');
    this.animate();
};

UniverseViewPort.prototype.animate = function () {
    var t = this;
    requestAnimationFrame(function () { t.animate(); });
    this.render();
};

UniverseViewPort.prototype.clearCanvas = function () {
    this.canvasContext.fillStyle = 'rgb(0,0,0)';
    this.canvasContext.fillRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
};

UniverseViewPort.prototype.render = function () {
    var tick = new Date().getTime();

    var dt = tick - this.lastTick;

    if (dt > 0) {
        this.vm.universe.update(dt);
    }

    this.clearCanvas();

    this.canvasContext.fillStyle = 'rgb(255,255,255)';

    for (var i = this.vm.universe.bodies.length - 1; i >= 0; i--) {
        if (i < this.vm.universe.bodies.length) {
            var body = this.vm.universe.bodies[i];

            if (body) {
                this.updateBodyView(body);
            }
        }
    }

    this.lastTick = tick;
};


UniverseViewPort.prototype.updateBodyView = function (body) {
    this.canvasContext.save();

    //this.canvasContext.fillRect(body.x(), body.y(), body.radius, body.radius);

    var r = body.radius;

    this.canvasContext.translate(body.x(), body.y());
    this.canvasContext.beginPath()
    this.canvasContext.moveTo(r, 0);
    for (i = 0; i < 9; i++) {
        this.canvasContext.rotate(Math.PI / 5);
        if (i % 2 == 0) {
            this.canvasContext.lineTo((r / 0.525731) * 0.200811, 0);
        } else {
            this.canvasContext.lineTo(r, 0);
        }
    }
    this.canvasContext.closePath();
    this.canvasContext.fill();

    this.canvasContext.restore();
};