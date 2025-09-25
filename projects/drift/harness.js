let  _canvasBitmap;
let seed = 17;
let c = 2;
const HEIGHT = 64, WIDTH = 64;

// fire
// const _palette = [0x000000, 0x000011, 0x000022, 0x000033, 0x000044, 0x000055, 0x000066, 0x000077,
//     0x000088, 0x000099, 0x0000aa, 0x0000bb, 0x0000cc, 0x0000dd, 0x0000ee, 0x0000ff];

// rainbow
const _palette = [0x000000, 0xff453a, 0xff923a, 0xfec7, 0xffdb3a, 0x8cff3a, 0x42ff3a, 0x3aff73,
    0x3affbd, 0x3af3ff, 0x3aa6ff, 0x3a5dff, 0x5a39ff, 0xa539ff, 0xf739ff, 0xff39bd];

let _initFunc = (context) => {
    context.color = 1;
    context.speed = 0.001;
    context.weights = new Array(64).fill(0); 
};

let _updateFunc = (context) => {
    const TWOPI = 2 * Math.PI;

    context.color = ++context.color;

    if(context.color > 15) context.color = 1;

    let ratio = 0;

    for (let r = 1; r < 32; r++) {
        let w = context.weights[r] + ratio;

        if (w >= TWOPI) w -= TWOPI;

        context.weights[r] = w;

        let px = Math.trunc(32 + r * Math.sin(w));
        let py = Math.trunc(32 + r * Math.cos(w));

        context.pixels[px][py] = context.color;
        ratio += context.speed;
        context.speed += 0.0000001;
    }

    context.pattern.fade();
};

const renderer = {
    clear: () => {
        _canvasBitmap.fillStyle = 'green';
        _canvasBitmap.fillRect(0, 0, WIDTH, HEIGHT);
    },

    render: () => {

        context.frameCount = context.frameCount + 1;

        try {
            // eval pattern_update
            _updateFunc(context);
        } catch (error) {
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

        requestAnimationFrame(renderer.render);
    },

    run: () => {
        
        try {
            // eval pattern_init
            _initFunc(context);
        } catch (error) {
            renderer.stop();
            return;
        }
        renderer.render();
    }
}


const context = {
    framesPerSecond: 60,
    frameCount: 0,
    pixels: new Array(WIDTH),
    log: (msg) => out(msg),
    rnd_lfsr: ( a,  b) => {
        seed ^= (seed << a);
        seed ^= (seed >> b);
        seed ^= (seed << c);
        // just return it as it's random anyways...
        return seed;
      },
    renderer: renderer,

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


export const init = (canvasBitmap) => {
    _canvasBitmap = canvasBitmap.getContext('2d');

    renderer.clear();

    for (let i = 0; i < HEIGHT; i++) {
        context.pixels[i] = new
            Array(WIDTH).fill(0);
    }

    renderer.run();
}

