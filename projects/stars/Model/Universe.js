// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function (item) {
    var index = this.indexOf(item);

    if (index == -1) return this;

    var rest = this.slice(index + 1 || this.length);
    this.length = index < 0 ? this.length + index : index;
    return this.push.apply(this, rest);
};

var Universe = function (onUniverseCleared, onBodyRemoved) {
    this.gravity = new Vector(0, 0);
    this.bodies = [];
    this.onUniverseCleared = onUniverseCleared;
    this.onBodyRemoved = onBodyRemoved;
};

Universe.prototype.add = function (body) {
    this.bodies.push(body);
};

Universe.prototype.clear = function () {
    this.bodies = [];

    if (this.onUniverseCleared && typeof (this.onUniverseCleared) === 'function') {
        this.onUniverseCleared();
    }
};

Universe.prototype.update = function (dt) {
    for (var i = this.bodies.length - 1; i >= 0; i--) {

        var body = this.bodies[i];

        if (body.isDynamic) {
            body.update(dt);

            if (body.x() > 1000 || body.y() > 1000 || body.x() < 0 || body.y() < 0) {
                // out of bounds
                this.bodies.remove(body);

                if (this.onBodyRemoved && typeof (this.onBodyRemoved) === 'function') {
                    this.onBodyRemoved(body);
                }

                continue;
            }

            this.applyGravity(body);
        }
    }
};

Universe.prototype.applyGravity = function (body) {
    var initialVelocity = body.getVelocity();
    var finalVelocity = initialVelocity.add(this.gravity);
    body.setVelocity(finalVelocity);
};

Universe.prototype.setGravity = function (gravity) {
    this.gravity = gravity;
};


var universetest = function () {

    var cb1 = function () {
        alert('universe cleared!');
    };

    var cb2 = function (body) {
        console.log(body);
        alert('body removed');
    };

    var u = new Universe(cb1, cb2);

    u.add(new Body());
    u.add(new Body());

    console.log(u.bodies.length);

    u.clear();

    console.log(u.bodies.length);

    var b = new Body();
    b.isDynamic = true;

    u.add(b);
    console.log(u.bodies.length);

    u.bodies.remove(b);
    console.log(u.bodies.length);

    u.bodies.remove(b);
    console.log(u.bodies.length);

    u.add(b);
    console.log(u.bodies.length);
    u.update(123);
};