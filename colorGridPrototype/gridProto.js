

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

    extrapolatedAt(x, y) {
        if(this.at(x, y) != null) return this.at(x, y);

        const nearestColor = maxBy(
            this.getDefinedColors(),
            ([x1, y1, color]) => -((y1 - y) ** 2 + (x1 - x) ** 2),
        );

        if(!nearestColor) return null;

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


        console.log(`bestVerticalPair for ${x} ${y}: ${bestVerticalPair}`);
        console.log(`bestHorizontalPair for ${x} ${y}: ${bestHorizontalPair}`);

        let [x0, y0, basisColor] = nearestColor;
        let [[ , y1, v1], [ , y2, v2]] = bestVerticalPair;
        let [[x1 , , h1], [x2 , , h2]] = bestHorizontalPair;

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

            // ensure that abs(c1.h() - c2.h()) <= 180
            if(Math.abs(c1.h() - c2.h()) > 180) {
                c1Arr[0] -= 360;
            }
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
