var UniverseViewModel = function (onUniverseCleared, onBodyRemoved) {
    this.universe = new Universe(onUniverseCleared, onBodyRemoved);
    this.viewPortInfo = new ViewPortInfo();
    this.spawnPoint = new Point(0, 0);
    this.spawnTimerId;

    this.startSpawning();
};

UniverseViewModel.prototype.spawn = function () {

    var s = this.getSpeed();

    var body = new Body();
    body.mass = 10;
    body.radius = nextRandom(10, 50);
    body.color = "#FFFFFF";
    body.isDynamic = true,
    body.speed = s;
    body.direction = nextRandom(0, 628) * 0.01;

    body.location = new Point((this.spawnPoint.x / this.viewPortInfo.scale) - this.viewPortInfo.horizontalOffset,
                            -(this.spawnPoint.y / this.viewPortInfo.scale) - this.viewPortInfo.verticalOffset);

    this.universe.add(body);
};

UniverseViewModel.prototype.getSpeed = function () {
    var s = nextRandom(-100000, 100000) * 0.001;

    if (Math.abs(s) < 10) {
        return this.getSpeed();
    }

    return s;
};

UniverseViewModel.prototype.startSpawning = function () {
    var t = this;
    this.spawnTimerId = window.setInterval(function () {
        t.spawn();
    }, 15);
};


UniverseViewModel.prototype.setGravity = function (gravity) {
    this.universe.setGravity(gravity);
};


var nextRandom = function (min, max) {
    return min + Math.random() * (max - min);
};


