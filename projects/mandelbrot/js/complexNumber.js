var complexNumber = function (real, imaginary) {
    this.r = real;
    this.i = imaginary;
};

complexNumber.prototype.toString = function () {
    return '{' + this.r + ',' + this.i + '}';
}

complexNumber.prototype.add = function (value) {
    return new complexNumber(this.r + value.r, this.i + value.i);
};

complexNumber.prototype.subtract = function (value) {
    return new complexNumber(this.r - value.r, this.i - value.i);
};

complexNumber.prototype.multiply = function (value) {
    return new complexNumber(this.r * value.r - this.i * value.i, this.i * value.r + this.r * value.i);
};

complexNumber.prototype.conjugate = function () {
    return new complexNumber(this.r, -this.i);
};



var complexTests = function () {
    var test = new complexNumber(3, 4);
    var test1 = new complexNumber(2, 3);

    console.log(test.toString());
    console.log(typeof test);
    test = test.add(test1);

    console.log(test.toString());

    test = new complexNumber(0, 1);

    console.log(test.multiply(test).toString());

    console.log(test1.toString());
    console.log(test1.conjugate().toString());
    console.log(test1.conjugate().conjugate().toString());


    console.log(test1.multiply(test1.conjugate()).toString());


    console.log('multiplication');
    test = new complexNumber(2, 3);
    test1 = new complexNumber(3, 4);
    console.log('assert: -6,17', test.multiply(test1).toString());

    console.log(test.toString());
    console.log(test1.toString());
    console.log(test1.multiply(test1.conjugate()).toString());
};