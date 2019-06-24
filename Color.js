class Model{
    constructor() {
        this.changeListeners = [];
    }

    onChange(cb) {
        this.changeListeners.push(cb);
    }

    triggerChange() {
        this.changeListeners.forEach(cb => cb(this));
    }
}

class Color extends Model{
	constructor() {
        super();
        this.isRgb = true;
        this.value = [0, 0, 0, 255];
    }

    r() { return this._asRgb()[0]; }
    g() { return this._asRgb()[1]; }
    b() { return this._asRgb()[2]; }
    h() { return this._asHsv()[0]; }
    s() { return this._asHsv()[1]; }
    v() { return this._asHsv()[2]; }
    a() { return this._asRgb()[3]; }

    setR(v) {
    	this._convertToRgb();
        this.value[0] = v;
        this.triggerChange();
    }
    setG(v) {
    	this._convertToRgb();
        this.value[1] = v;
        this.triggerChange();
    }
    setB(v) {
    	this._convertToRgb();
        this.value[2] = v;
        this.triggerChange();
    }
    setH(v) {
    	this._convertToHsv();
        this.value[0] = v;
        this.triggerChange();
    }
    setS(v) {
    	this._convertToHsv();
        this.value[1] = v;
        this.triggerChange();
    }
    setV(v) {
    	this._convertToHsv();
        this.value[2] = v;
        this.triggerChange();
    }
    setA(v) {
    	this.value[3] = v;
        this.triggerChange();
    }

    _convertToRgb() {
    	this.value = this._asRgb();
        this.isRgb = true;
    }
    _convertToHsv() {
    	this.value = this._asHsv();
        this.isRgb = false;
    }

    _asHsv() {
    	if(!this.isRgb) {
			return this.value.slice();
        }else{
        	let h, s, v;
            let [r, g, b, a] = this.value;
        	let max = Math.max(r, g, b);
        	let min = Math.min(r, g, b);
            if(max == min) {
            	h = 0;
            }else if(max == r) {
            	h = 60 * (0 + (g - b) / (max - min));
            }else if(max == g) {
            	h = 60 * (2 + (b - r) / (max - min));
            }else if(max == b) {
            	h = 60 * (4 + (r - g) / (max - min));
            }
            while(h < 0) h += 360;
            if(max == 0) {
            	s = 0;
            }else{
            	s = (max - min) / max * 100;
            }
            v = max / 255 * 100;
            return [+h.toFixed(0), +s.toFixed(1), +v.toFixed(1), a];
        }
    }

    _asRgb() {
    	if(this.isRgb) {
        	return this.value.slice();
        }else{
        	let r, g, b;
            let [h, s, v, a] = this.value;
            let c = v * s / 100**2;
            let hp = h/60;
            let x = c * (1 - Math.abs(hp % 2 - 1));
            let withoutM = [
            	[c, x, 0],
            	[x, c, 0],
            	[0, c, x],
            	[0, x, c],
            	[x, 0, c],
            	[c, 0, x],
            ][(~~hp) % 6];
            let m = v/100 - c;
            return [...withoutM.map(v => v + m).map(v => v*255).map(Math.round), a];
        }
    }
};
