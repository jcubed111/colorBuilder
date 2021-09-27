class GridController extends View{
    el() {
        return document.getElementById('gridController');
    }

    constructor(colorPointer) {
        super();
        this.colorPointer = colorPointer;
        this.colorGrid = new ColorGrid(3, 3);

        this.subViews = [];

        this.colorGrid.onChange(e => this.render());
        this.render();
    }

    initSubViews() {
        this.subViews.forEach(v => v.remove());
        this.subViews = [];

        this.colorGrid.forEachPos(([x, y], value) => {
            this.subViews.push(
                new GridSwatchController([x, y], this.colorGrid, this.colorPointer),
            );
        });

        while(this.$('.elementArea').firstChild) {
            this.$('.elementArea').firstChild.remove();
        }

        this.subViews.forEach(v => this.$('.elementArea').appendChild(v.el));
    }

    render() {
        if(this.width != this.colorGrid.width || this.height != this.colorGrid.height) {
            this.renderResize();
        }
        this.renderBlend();
    }

    renderResize() {
        this.width = this.colorGrid.width;
        this.height = this.colorGrid.height;

        this.initSubViews();

        this.$('.elementArea').style.width = `${this.colorGrid.width - 1}em`;
        this.$('.elementArea').style.height = `${this.colorGrid.height - 1}em`;

        // We pull the grid square from the css font-size property. This
        // allow sus to position sub elements using em units.
        // But we need it here to set the canvas size manually.
        let gridSize = parseInt(getComputedStyle(this.el).getPropertyValue('font-size'));
        this.$('#gridRenderCanvas').width = (this.colorGrid.width - 1) * gridSize;
        this.$('#gridRenderCanvas').height = (this.colorGrid.height - 1) * gridSize;
    }

    renderBlend() {
        // renders the color blend background
        const colorGrid = this.colorGrid;
        const canvas = this.$('#gridRenderCanvas');
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
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.disable(gl.BLEND);

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
}

class GridSwatchController extends View{
    el() {
        return document.importNode(document.getElementById('gridSwatch').content, true).children[0];
    }

    constructor([x, y], colorGrid, colorPointer) {
        super();

        this.x = x;
        this.y = y;
        this.colorGrid = colorGrid;
        this.colorPointer = colorPointer;

        colorPointer.onChange(_ => this.render());
        this.gridListener = colorGrid.onChange(_ => this.render());
        this.render();

        this.el.addEventListener('click', e => {
            this.select(e);
            e.stopPropagation();
        });
        this.el.addEventListener('dblclick', e => {
            this.unlock(e);
            e.stopPropagation();
        });
    }

    remove() {
        this.colorGrid.offChange(this.parentListener);
        super.remove();
    }

    select(e) {
        // set this color as the active color
        if(this.colorGrid.at(this.x, this.y) === null) {
            this.colorGrid.initSwatch(this.x, this.y);
        }
        this.colorPointer.pointTo(this.colorGrid.at(this.x, this.y));
    }

    unlock(e) {
        // don't allow unlock if we're the only color left
        if(this.colorGrid.getDefinedColors().length <= 1) {
            return;
        }
        // if this color is not null, set it to null
        this.colorGrid.unlockSwatch(this.x, this.y);
        // if none of the colors in the grid are active,
        // change the active color.
        if(!this.colorGrid.getDefinedColors().some(
            ([x, y, color]) => this.colorPointer.isPointingTo(color)
        )) {
            let [x, y, targetColor] = this.colorGrid.getDefinedColors()[0];
            this.colorPointer.pointTo(targetColor);
        }
    }

    render() {
        let color = this.colorGrid.at(this.x, this.y);
        this.el.classList.toggle('unlocked', color == null);
        this.el.classList.toggle('active', this.colorPointer.isPointingTo(color));
        this.el.classList.toggle('light',
            (
                color
                || this.colorGrid.extrapolatedAt(this.x, this.y)
                || new Color()
            ).useLightContrast(),
        );

        this.el.style.left = `${this.x}em`;
        this.el.style.bottom = `${this.y}em`;

        if(color != null) {
            this.el.style.backgroundImage = `
                linear-gradient(${color}, ${color}),
                url(checkers.png)`;
        }else{
            this.el.style.backgroundImage = "";
        }
    }
}
