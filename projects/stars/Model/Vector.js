var Vector = function (x, y) {
    this.x = x;
    this.y = y;
};

Vector.prototype.length = function () {
    return Math.sqrt(this.lengthSquared());
};

Vector.prototype.lengthSquared = function () {
    return (this.x * this.x) + (this.y * this.y);
};

Vector.prototype.angle = function () {
    return Math.atan2(this.y, this.x);
};

Vector.prototype.add = function(value){
    return new Vector(this.x + value.x, this.y + value.y);
};


var vectorTest = function () {

    var v1 = new Vector(10, 10);
    var v2 = new Vector(10, 10);

    var v3 = v1.add(v2);

    console.log(v3.x, v3.y);
    console.log('should be: 20,20');

    console.log(v3.angle(), v3.length(), v3.lengthSquared());
};
