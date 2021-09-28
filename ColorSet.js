class ColorSet{
    constructor(colorArray2d) {
        this.colorArray2d = colorArray2d;
        this.width = colorArray2d.length;
        this.height = colorArray2d[0].length;
    }

    isGridSource() {
        return this.height > 1 && this.width > 1;
    }

    asList() {
        return this.colorArray2d.flatMap(a => a);
    }

    at(x, y) {
        // x, y in [0, 1]
        x = clamp(x, 0, 1) * (this.width - 1.0);
        y = clamp(y, 0, 1) * (this.height - 1.0);

        // c_xy
        let c_00 = this.colorArray2d?.[Math.floor(x)]?.[Math.floor(y)] ?? new Color();
        let c_01 = this.colorArray2d?.[Math.floor(x)]?.[Math.floor(y) + 1] ?? new Color();
        let c_10 = this.colorArray2d?.[Math.floor(x) + 1]?.[Math.floor(y)] ?? new Color();
        let c_11 = this.colorArray2d?.[Math.floor(x) + 1]?.[Math.floor(y) + 1] ?? new Color();

        return mixColors(
            mixColors(c_00, c_10, x % 1),
            mixColors(c_01, c_11, x % 1),
            y % 1
        );
    }

    map(...args) {
        return this.asList().map(...args);
    }
}
