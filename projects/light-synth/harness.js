let _outElement, _initCodeBlock, _updateCodeBlock, _canvasBitmap, _runButton, _isRendering, _clearConsoleButton;
let _initFunc, _updateFunc;
let seed = 17;
let c = 2;
const HEIGHT = 64, WIDTH = 64;

// fire
// const _palette = [0x000000, 0x000011, 0x000022, 0x000033, 0x000044, 0x000055, 0x000066, 0x000077,
//     0x000088, 0x000099, 0x0000aa, 0x0000bb, 0x0000cc, 0x0000dd, 0x0000ee, 0x0000ff];

// rainbow
const _palette = [0x000000, 0xff453a, 0xff923a, 0xfec7, 0xffdb3a, 0x8cff3a, 0x42ff3a, 0x3aff73,
    0x3affbd, 0x3af3ff, 0x3aa6ff, 0x3a5dff, 0x5a39ff, 0xa539ff, 0xf739ff, 0xff39bd];

const out = (value) => _outElement.innerText += value;
const invoke = (func) => func.call(null).call(null, context);
const clearOut = () => _outElement.innerText = 'ready.\r\n';

const renderer = {
    clear: () => {
        _canvasBitmap.fillStyle = 'green';
        _canvasBitmap.fillRect(0, 0, WIDTH, HEIGHT);
    },

    render: () => {

        context.frameCount = context.frameCount + 1;

        try {
            // eval pattern_update
            invoke(_updateFunc);
        } catch (error) {
            out('error in pattern_update:\r\n');
            out(error);
            out('\r\n');
            renderer.stop();
        }

        // iterate the pixels to draw/
        // lookup palette
        let bmp = _canvasBitmap.createImageData(WIDTH, HEIGHT);
        let index = 0;

        for (let x = 0; x < WIDTH; x++) {
            for (let y = 0; y < HEIGHT; y++) {
                let pixel = context.pixels[x][y];

                index = 4 * (y * WIDTH + x);

                // some bit-twiddling here to convert that 24 bit number in the palette to RGB
                // RGBA
                bmp.data[index++] = (0x0000ff & _palette[pixel]);
                bmp.data[index++] = (0x00ff00 & _palette[pixel]) >> 8;
                bmp.data[index++] = (0xff0000 & _palette[pixel]) >> 16;
                bmp.data[index++] = 255;
            }
        }

        _canvasBitmap.putImageData(bmp, 0, 0);

        if (_isRendering)
            requestAnimationFrame(renderer.render);
    },

    run: () => {
        _isRendering = true;
_initFunc = new Function("{ return function(context) {" + _initCodeBlock.value + "}}");
    _updateFunc = new Function("{ return function(context) {" + _updateCodeBlock.value + "}}");

        out('started rendering\r\n');
        _runButton.innerText = 'Stop';
        
        try {
            // eval pattern_init
            invoke(_initFunc);
        } catch (error) {
            renderer.stop();
            out('error in pattern_init:\r\n');
            out(error);
            out('\r\n');
            
            return;
        }
        renderer.render();
    },

    stop: () => {
        _isRendering = false;
        _runButton.innerText = 'Run';
        out('stopped rendering\r\n');
    }
}

const runStop = () => {
    _isRendering ? renderer.stop() : renderer.run();
}

const context = {
    framesPerSecond: 60,
    frameCount: 0,
    pixels: new Array(WIDTH),
    log: (msg) => out(msg + "\r\n"),
    rnd_lfsr: ( a,  b) => {
        seed ^= (seed << a);
        seed ^= (seed >> b);
        seed ^= (seed << c);
        // just return it as it's random anyways...
        return seed;
      },
    renderer: renderer,
    out: out,
    pattern: {
        fadeDelay: 0,
        fade: (delay = 0)=>{
            context.pattern.fadeDelay--;
            if(context.pattern.fadeDelay <= 0) {
                context.pattern.fadeDelay = delay;
                for (let x = 0; x < WIDTH; x++) {
                    for (let y = 0; y < HEIGHT; y++) {
                        let sample = context.pixels[x][y];
                        if (sample > 0) sample--;
                        context.pixels[x][y] = sample;
                    }
                }
            }
        }
    }
};

export const init = (outElement, initCodeBlock, updateCodeBlock, canvasBitmap, runButton, clearConsoleButton) => {
    _outElement = outElement;
    _initCodeBlock = initCodeBlock;
    _updateCodeBlock = updateCodeBlock;
    _canvasBitmap = canvasBitmap.getContext('2d');
    _runButton = runButton;
    _clearConsoleButton = clearConsoleButton;

    out('initializing...\r\n');
    out('\r\ncontext:{\r\n');
    out('\u00a0\u00a0\u00a0\u00a0     framesPerSecond: number (60), \r\n');
    out('\u00a0\u00a0\u00a0\u00a0     frameCount: number, \r\n');
    out('\u00a0\u00a0\u00a0\u00a0     pixels: 2d array number[64][64], \r\n');
    out('\u00a0\u00a0\u00a0\u00a0     log(msg), \r\n');
    out('\u00a0\u00a0\u00a0\u00a0     pattern.fade(), \r\n');
    out('\u00a0\u00a0\u00a0\u00a0     pattern.fadeDelay: number, \r\n');
    out('}\r\n\r\n');

    renderer.clear();

    _isRendering = false;
    _runButton.addEventListener('click', runStop);
    _clearConsoleButton.addEventListener('click', clearOut);

    for (let i = 0; i < HEIGHT; i++) {
        context.pixels[i] = new
            Array(WIDTH).fill(0);
    }

    out('ready.\r\n\r\n');
}