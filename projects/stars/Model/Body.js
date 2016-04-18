// leak to global
nextId = 0;

var Body = function () {
    this.id = "body_" + nextId++;
    this.mass = 0;
    this.radius = 0;
    this.location = new Point(0, 0);
    this.color = "#000000";
    this.isDynamic = false;
    this.direction = 0;
    this.speed = 0;
    this.age = 0;
};

Body.prototype.x = function () {
    return this.location.x;
};

Body.prototype.y = function () {
    return this.location.y;
};

Body.prototype.setVelocity = function (velocity) {
    this.speed = velocity.length();
    this.direction = velocity.angle();
};

Body.prototype.update = function (dt) {
    if (this.isDynamic) {
        this.location = new Point(this.x() + this.speed * Math.cos(this.direction) / dt,
                    this.y() + this.speed * Math.sin(this.direction) / dt);
    }

    this.age++;

    if (this.age % 3 == 0) {
        this.radius--;
        if (this.radius < 0) {
            this.radius = 0;
        }
    }
};

Body.prototype.getVelocity = function () {
    return new Vector(this.speed * Math.cos(this.direction), this.speed * Math.sin(this.direction));
};

