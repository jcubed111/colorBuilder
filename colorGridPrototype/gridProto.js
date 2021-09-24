

class ColorGrid{
    constructor(width=3, height=3) {
        this.width = width;
        this.height = height;
        this.colors = Array(width).fill(0).map(_ => Array(height).fill(null));

        this.vertMode = 'hsv';
        this.horzMode = 'hsv';
    }

    at(x, y) {
        return this.colors[mod(x, this.width)][mod(y, this.height)];
    }

    set(x, y, color) {
        this.colors[mod(x, this.width)][mod(y, this.height)] = color;
    }

    getDefinedColors() { // : List[(x, y, color)]
        return this.colors
            .flatMap((col, x) => col.map((color, y) => [x, y, color]))
            .filter(([x, y, color]) => color);
    }

    getDefinedVerticalPairs() { // : List[((x, y, color), (x, y, color))]
        let result = [];
        this.colors.forEach((col, x) => {
            let annotatedCol = col.map((color, y) => [x, y, color]).filter(([x, y, c]) => c);
            for(let i = 0; i < annotatedCol.length; i++) {
                for(let j = i + 1; j < annotatedCol.length; j++) {
                    result.push([annotatedCol[i], annotatedCol[j]]);
                }
            }
        });
        return result;
    }

    getDefinedHorizontalPairs() { // : List[((x, y, color), (x, y, color))]
        let result = [];
        for(let y = 0; y < this.height; y++) {
            for(let x1 = 0; x1 < this.width; x1++) {
                if(!this.at(x1, y)) continue;
                for(let x2 = x1 + 1; x2 < this.width; x2++) {
                    if(!this.at(x2, y)) continue;
                    result.push([[x1, y, this.at(x1, y)], [x2, y, this.at(x2, y)]]);
                }
            }
        }
        return result;
    }

    extrapolatedAt(x, y, defaultReturn = null) {
        if(this.at(x, y) != null) return this.at(x, y);

        const nearestColor = maxBy(
            this.getDefinedColors(),
            ([x1, y1, color]) => -((y1 - y) ** 2 + (x1 - x) ** 2),
        );

        if(!nearestColor) return defaultReturn;

        // get the closest vertical pair of defined colors, preferring a pair
        // that contains our current y, then preferring the least total distance.
        const bestVerticalPair = maxBy(
            this.getDefinedVerticalPairs(),
            ([[x1, y1, c1], [x2, y2, c2]]) => {
                let pairRank = 0;
                if((y1 - y) * (y2 - y) <= 0) pairRank += 1e6;
                pairRank -= Math.sqrt((y1 - y) ** 2 + (x1 - x) ** 2);
                pairRank -= Math.sqrt((y2 - y) ** 2 + (x2 - x) ** 2);

                return pairRank;
            }
        ) || [nearestColor, nearestColor];

        // get the closest horizontal pair of defined colors, preferring a pair
        // that contains our current x, then preferring the least total distance.
        const bestHorizontalPair = maxBy(
            this.getDefinedHorizontalPairs(),
            ([[x1, y1, c1], [x2, y2, c2]]) => {
                let pairRank = 0;
                if((x1 - x) * (x2 - x) <= 0) pairRank += 1e6;
                pairRank -= Math.sqrt((y1 - y) ** 2 + (x1 - x) ** 2);
                pairRank -= Math.sqrt((y2 - y) ** 2 + (x2 - x) ** 2);

                return pairRank;
            }
        ) || [nearestColor, nearestColor];


        // console.log(`bestVerticalPair for ${x} ${y}: ${bestVerticalPair}`);
        // console.log(`bestHorizontalPair for ${x} ${y}: ${bestHorizontalPair}`);

        let [x0, y0, basisColor] = nearestColor;
        let [[ , y1, v1], [ , y2, v2]] = bestVerticalPair;
        let [[x1,  , h1], [x2,  , h2]] = bestHorizontalPair;

        // return basisColor;

        return basisColor
            .plus(this.modeDiff(v1, v2, (y - y0) / ((y1 - y2) || 1), this.vertMode))
            .plus(this.modeDiff(h1, h2, (x - x0) / ((x1 - x2) || 1), this.horzMode));
    }

    modeDiff(c1, c2, factor, mode) {
        // returns (c1 - c2) * factor using the given mode
        // if mode is 'hsv', always go the short hue way
        let c1Arr, c2Arr;
        if(mode == 'rbg') {
            c1Arr = [c1.r(), c1.g(), c1.b(), c1.a()];
            c2Arr = [c2.r(), c2.g(), c2.b(), c2.a()];
        }else{
            c1Arr = [c1.h(), c1.s(), c1.v(), c1.a()];
            c2Arr = [c2.h(), c2.s(), c2.v(), c2.a()];
        }

        let result = new Color();
        result.isRgb = mode == 'rbg';
        result.value = [
            (c1Arr[0] - c2Arr[0]) * factor,
            (c1Arr[1] - c2Arr[1]) * factor,
            (c1Arr[2] - c2Arr[2]) * factor,
            (c1Arr[3] - c2Arr[3]) * factor,
        ];

        // take care of an edge case in hue mode
        if(mode != 'rbg') result.value[0] = angleSub(c1Arr[0], c2Arr[0]) * factor;

        return result;
    }
}


const colorGrid = new ColorGrid();


function render() {
    for(let x = 0; x < 3; x++) {
        for(let y = 0; y < 3; y++) {
            let color = colorGrid.at(x, y);
            document.getElementById(`s${x}x${y}`).style.backgroundColor = color?.toString() ?? "transparent";
            let extrapolatedColor = colorGrid.extrapolatedAt(x, y);
            document.getElementById(`e${x}x${y}`).style.backgroundColor = extrapolatedColor?.toString() ?? "transparent";
        }
    }

    renderCanvas();
}

function renderCanvas() {
    const canvas = document.getElementById("render");
    const gl = canvas.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
        precision highp float;

        attribute vec4 vertexPosition;
        attribute vec4 colorPosition;

        varying vec4 texCoord;

        void main() {
            gl_Position = vertexPosition * vec4(2.0, 2.0, 0.0, 1.0) - vec4(1.0, 1.0, 0.0, 0.0);
            texCoord = colorPosition;
        }
    `);
    gl.compileShader(vertexShader);
    console.log(gl.getShaderInfoLog(vertexShader));

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        precision highp float;

        varying vec4 texCoord;

        uniform vec4 colorA; uniform vec4 colorB;
        uniform vec4 colorC; uniform vec4 colorD;
        uniform int colorsInHsv;

        vec3 hsv2rgb(vec3 c) { // From https://stackoverflow.com/a/17897228/136924
            vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        float angleSub(float angle1, float angle2) {
            float diff = fract(angle1 - angle2 + 0.5) - 0.5;
            return diff < -0.5 ? diff + 1.0 : diff;
        }

        float hueMix(float h1, float h2, float a) {
            float delta = angleSub(h2, h1);
            return fract(h1 + delta * a);
        }

        void main() {
            if(colorsInHsv == 0) {
                gl_FragColor = mix(
                    mix(colorC, colorD, texCoord.x),
                    mix(colorA, colorB, texCoord.x),
                    texCoord.y
                );
            }else{
                vec4 hsva;
                hsva.r = hueMix(
                    hueMix(colorC.r, colorD.r, texCoord.x),
                    hueMix(colorA.r, colorB.r, texCoord.x),
                    texCoord.y
                );
                hsva.gba = mix(
                    mix(colorC, colorD, texCoord.x),
                    mix(colorA, colorB, texCoord.x),
                    texCoord.y
                ).gba;
                gl_FragColor = vec4(hsv2rgb(hsva.rgb), hsva.a);
            }
        }
    `);
    gl.compileShader(fragmentShader);
    console.log(gl.getShaderInfoLog(fragmentShader));

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    console.log(gl.getProgramInfoLog(shaderProgram));
    gl.useProgram(shaderProgram);
    gl.viewport(0, 0, 500, 500);

    const attribLocations = {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'vertexPosition'),
        colorPosition: gl.getAttribLocation(shaderProgram, 'colorPosition'),
    };
    const uniformPositions = {
        colorA: gl.getUniformLocation(shaderProgram, 'colorA'),
        colorB: gl.getUniformLocation(shaderProgram, 'colorB'),
        colorC: gl.getUniformLocation(shaderProgram, 'colorC'),
        colorD: gl.getUniformLocation(shaderProgram, 'colorD'),
        colorsInHsv: gl.getUniformLocation(shaderProgram, 'colorsInHsv'),
    };

    for(let x = 0; x < colorGrid.width - 1; x++) {
        for(let y = 0; y < colorGrid.height - 1; y++) {
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const x0 = x / (colorGrid.width - 1);
            const x1 = (x + 1) / (colorGrid.width - 1);
            const y0 = y / (colorGrid.height - 1);
            const y1 = (y + 1) / (colorGrid.height - 1);
            const positions = [
                x0, y1,
                x1, y1,
                x0, y0,
                x1, y0,
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            gl.vertexAttribPointer(
                attribLocations.vertexPosition,
                2,
                gl.FLOAT,
                false,
                0,
                0,
            );
            gl.enableVertexAttribArray(attribLocations.vertexPosition);

            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), gl.STATIC_DRAW);

            gl.vertexAttribPointer(
                attribLocations.colorPosition,
                2,
                gl.FLOAT,
                false,
                0,
                0,
            );
            gl.enableVertexAttribArray(attribLocations.colorPosition);

            const useHsvBlending = false;
            gl.uniform1i(uniformPositions.colorsInHsv, useHsvBlending ? 1 : 0);

            [
                [uniformPositions.colorA, colorGrid.extrapolatedAt(x, y + 1)],
                [uniformPositions.colorB, colorGrid.extrapolatedAt(x + 1, y + 1)],
                [uniformPositions.colorC, colorGrid.extrapolatedAt(x, y)],
                [uniformPositions.colorD, colorGrid.extrapolatedAt(x + 1, y)],
            ].forEach(([uPos, color]) => {
                if(!color) {
                    gl.uniform4fv(uPos, [0, 0, 0, 0]);
                }else{
                    if(useHsvBlending) {
                        gl.uniform4fv(uPos, [
                            color.h() / 360.0,
                            color.s() / 100.0,
                            color.v() / 100.0,
                            color.a() / 255.0,
                        ]);
                    }else{
                        gl.uniform4fv(uPos, color._asRgb().map(v => v / 255.0));
                    }
                }
            });

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
    }
}

function onInput() {
    for(let x = 0; x < 3; x++) {
        for(let y = 0; y < 3; y++) {
            const parsed = parseColor(document.getElementById(`i${x}x${y}`).value);
            colorGrid.set(x, y, parsed || null);
        }
    }
    render();
}

for(let x = 0; x < 3; x++) {
    for(let y = 0; y < 3; y++) {
        document.getElementById(`i${x}x${y}`).addEventListener('input', onInput);
    }
}
