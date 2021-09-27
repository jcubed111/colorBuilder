class Model{
    constructor() {
        this._changeListeners = [];
        this._nextId = 1;
    }

    onChange(cb) {
        this._changeListeners.push([cb, this._nextId]);
        return this._nextId++;
    }

    offChange(offId) {
        this._changeListeners = this._changeListeners.filter(([cb, id]) => id != offId);
    }

    triggerChange() {
        this._changeListeners.forEach(([cb, id]) => cb(this));
    }
}

class Color extends Model{
	constructor() {
        super();
        this.isRgb = true;
        this.value = [0, 0, 0, 255];
    }

    clone() {
        let c = new Color();
        c.isRgb = this.isRgb;
        c.value = this.value.slice();
        return c;
    }

    r() { return this._asRgb()[0]; }
    g() { return this._asRgb()[1]; }
    b() { return this._asRgb()[2]; }
    h() { return this._asHsv()[0]; }
    s() { return this._asHsv()[1]; }
    v() { return this._asHsv()[2]; }
    a() { return this._asRgb()[3]; }

    setRgb(r, g, b, a = this.a()) {
        this._convertToRgb();
        this.value[0] = r;
        this.value[1] = g;
        this.value[2] = b;
        this.value[3] = a;
        this.triggerChange();
    }

    setHsv(h, s, v, a = this.a()) {
        this._convertToHsv();
        this.value[0] = h;
        this.value[1] = s;
        this.value[2] = v;
        this.value[3] = a;
        this.triggerChange();
    }

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

    toString() {
        return rgb(...this._asRgb());
    }

    useLightContrast() {
        // returns whether light colors contrast better with this color
        return this.v() - 0.5 * this.s() <= 35;
    }
    getTextColor() {
        // return a contrasting color for text on top of this color
        this.useLightContrast() ? '#fff' : '#000';
    }

    plus(b) {
        // always do the math in the mode of b.
        let converted = b.isRgb ? this._asRgb() : this._asHsv();

        let result = new Color();
        result.isRgb = b.isRgb;
        result.value = converted.map((v, i) => v + b.value[i]);
        if(!result.isRgb) result.value[0] = mod(result.value[0], 360);

        return result;
    }
};

class ColorPointer extends Model{
    constructor() {
        super();
        this.isRgb = null;
        this.value = null;
        this.off = () => {};
    }

    pointTo(to) {
        // stop listening to anything we are listening to,
        // and start replicating the events of `to`
        this.off();
        this.to = to;

        const onChangeCb = (...args) => {
            this.isRgb = this.to.isRgb;
            this.value = this.to.value.slice();
            this.triggerChange(...args);
        };
        let toCbId = this.to.onChange(onChangeCb);

        // register a callback to stop listening to our current target
        this.off = _ => {
            this.to.offChange(toCbId);
        };

        // trigger an initial change
        onChangeCb();
    }

    isPointingTo(color) {
        return this.to === color;
    }

    setRgb(...args) { return this.to.setRgb(...args); }
    setHsv(...args) { return this.to.setHsv(...args); }
    setR(...args) { return this.to.setR(...args); }
    setG(...args) { return this.to.setG(...args); }
    setB(...args) { return this.to.setB(...args); }
    setH(...args) { return this.to.setH(...args); }
    setS(...args) { return this.to.setS(...args); }
    setV(...args) { return this.to.setV(...args); }
    setA(...args) { return this.to.setA(...args); }
    r(...args) { return this.to.r(...args); }
    g(...args) { return this.to.g(...args); }
    b(...args) { return this.to.b(...args); }
    h(...args) { return this.to.h(...args); }
    s(...args) { return this.to.s(...args); }
    v(...args) { return this.to.v(...args); }
    a(...args) { return this.to.a(...args); }

    clone(...args) { return this.to.clone(...args); }
    _convertToRgb(...args) { return this.to._convertToRgb(...args); }
    _convertToHsv(...args) { return this.to._convertToHsv(...args); }
    _asHsv(...args) { return this.to._asHsv(...args); }
    _asRgb(...args) { return this.to._asRgb(...args); }
    toString(...args) { return this.to.toString(...args); }
    getTextColor(...args) { return this.to.getTextColor(...args); }
}
