class PreviewController{
    constructor(modeCopyController) {
        this.ctxCanvas = document.getElementById('previewCanvasCtx');
        this.glCanvas = document.getElementById('previewCanvasGl');

        this.modeCopyController = modeCopyController;
        this.previewMode = 'smooth';

        window.addEventListener('resize', _ => this.render());
    }

    setMode(m, colorSet) {
        this.previewMode = m;
        this.render(colorSet);
    }

    render(colorSet) {
        this.ctxCanvas.width = this.glCanvas.width = window.innerWidth;
        this.ctxCanvas.height = this.glCanvas.height = window.innerHeight;

        this['render_' + this.previewMode](colorSet);
    }

    useGl() {
        this.ctxCanvas.style.display = 'none';
        this.glCanvas.style.display = 'block';
    }

    useCtx() {
        this.ctxCanvas.style.display = 'block';
        this.glCanvas.style.display = 'none';
    }

    clearCanvas() {
        this.ctxCanvas.getContext('2d').clearRect(0, 0, innerWidth, innerHeight);
    }

    render_smooth(colorSet) {
        if(colorSet.isGridSource()) {
            this.useGl();
            const renderer = new GridRenderer(colorSet, this.glCanvas);
            renderer.render(200 / innerWidth, 1.0 - (360 / innerWidth));
        }else{
            this.useCtx();
            this.clearCanvas();
            this.ctxCanvas.style.backgroundImage = colorsToBgImage(
                colorSet.map(v => v.toString())
            );
        }
    }

    render_bars(colorSet) {
        // TODO: better results for grid mode
        this.useCtx();
        this.clearCanvas();
        this.ctxCanvas.style.backgroundImage = colorsToBgImage(
            colorSet.map(v => v.toString()),
            false,
        );
    }

    render_swatches(colorSet) {
        this.useCtx();
        let ctx = this.ctxCanvas.getContext('2d');
        let colors = colorSet.asList();
        const size = 53;
        for(let x=0; x < window.innerWidth; x += size) {
            for(let y=0; y < window.innerHeight; y += size) {
                let i = Math.floor(Math.random() * colors.length);
                ctx.fillStyle = colors[i];
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    render_random(colorSet) {
        this.useCtx();
        let ctx = this.ctxCanvas.getContext('2d');
        const size = 53;
        for(let x=0; x < window.innerWidth; x += size) {
            for(let y=0; y < window.innerHeight; y += size) {
                ctx.fillStyle = colorSet.at(Math.random(), Math.random());
                ctx.fillRect(x, y, size, size);
            }
        }
    }
}

class GridRenderer{
    constructor(colorSet, canvas) {
        this.colorSet = colorSet;
        this.width = colorSet.width;
        this.height = colorSet.height;
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2');

        this.makeShaders();
    }

    makeShaders() {
        const gl = this.gl;

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
        // console.log(gl.getShaderInfoLog(vertexShader));

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
                }
                // it's important to pre-multiply the alpha for transparency to work
                gl_FragColor.rgb *= gl_FragColor.a;
            }
        `);
        gl.compileShader(fragmentShader);
        // console.log(gl.getShaderInfoLog(fragmentShader));

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // console.log(gl.getProgramInfoLog(shaderProgram));
        gl.useProgram(shaderProgram);

        this.attribLocations = {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'vertexPosition'),
            colorPosition: gl.getAttribLocation(shaderProgram, 'colorPosition'),
        };
        this.uniformPositions = {
            colorA: gl.getUniformLocation(shaderProgram, 'colorA'),
            colorB: gl.getUniformLocation(shaderProgram, 'colorB'),
            colorC: gl.getUniformLocation(shaderProgram, 'colorC'),
            colorD: gl.getUniformLocation(shaderProgram, 'colorD'),
            colorsInHsv: gl.getUniformLocation(shaderProgram, 'colorsInHsv'),
        };

        this.positionBuffer = gl.createBuffer();
    }

    render(x0 = 0, x1 = 1) {
        const gl = this.gl;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.disable(gl.BLEND);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if(x0 != 0) this.renderColumn(0, 0, 0, x0);
        for(let x = 0; x < this.width - 1; x++) {
            this.renderColumn(
                (x) / (this.width - 1),
                (x + 1) / (this.width - 1),
                x0 + (x1 - x0) *  x      / (this.width - 1),
                x0 + (x1 - x0) * (x + 1) / (this.width - 1),
            );
        }
        if(x1 != 1) this.renderColumn(1.0, 1.0, x1, 1.0);
    }

    renderColumn(gridX0, gridX1, screenX0, screenX1) {
        const gl = this.gl;
        for(let y = 0; y < this.height - 1; y++) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
            const y0 = y / (this.height - 1);
            const y1 = (y + 1) / (this.height - 1);
            const positions = [
                screenX0, y1,
                screenX1, y1,
                screenX0, y0,
                screenX1, y0,
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            gl.vertexAttribPointer(
                this.attribLocations.vertexPosition,
                2,
                gl.FLOAT,
                false,
                0,
                0,
            );
            gl.enableVertexAttribArray(this.attribLocations.vertexPosition);

            const texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]), gl.STATIC_DRAW);

            gl.vertexAttribPointer(
                this.attribLocations.colorPosition,
                2,
                gl.FLOAT,
                false,
                0,
                0,
            );
            gl.enableVertexAttribArray(this.attribLocations.colorPosition);

            const useHsvBlending = false;
            gl.uniform1i(this.uniformPositions.colorsInHsv, useHsvBlending ? 1 : 0);

            [
                [this.uniformPositions.colorA, this.colorSet.at(gridX0, (y + 1) / (this.colorSet.height - 1))],
                [this.uniformPositions.colorB, this.colorSet.at(gridX1, (y + 1) / (this.colorSet.height - 1))],
                [this.uniformPositions.colorC, this.colorSet.at(gridX0, (y) / (this.colorSet.height - 1))],
                [this.uniformPositions.colorD, this.colorSet.at(gridX1, (y) / (this.colorSet.height - 1))],
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
