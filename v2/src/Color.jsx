

function parsePercent(string) {
    // returns a float in [0, 1]
    if(string.toString().endsWith('%')) {
        return string.substr(string, string.length - 1) / 100;
    }else{
        return +string;
    }
}

function parseHue(string) {
    // always returns a value normalized to [0, 360)
    string = string.trim().toLowerCase();
    const normalize = n => ((Math.round(n) % 360) + 360) % 360;

    if(string.endsWith('deg')) {
        return normalize(parseFloat(string));
    }
    if(string.endsWith('grad')) {
        return normalize(parseFloat(string) / 400 * 360);
    }
    if(string.endsWith('rad')) {
        return normalize(parseFloat(string) / Math.PI * 180);
    }
    if(string.endsWith('turn')) {
        return normalize(parseFloat(string) * 360);
    }
    return normalize(parseFloat(string));
}

const hexMatcher = /^#?(?<r>[0-9a-f]{2})(?<g>[0-9a-f]{2})(?<b>[0-9a-f]{2})(?<a>[0-9a-f]{2})?$/i;
const hexShortMatcher = /^#?(?<r>[0-9a-f])(?<g>[0-9a-f])(?<b>[0-9a-f])(?<a>[0-9a-f])?$/i;
const rgbMatcher = /^rgba?\( *(?<r>[0-9]+) *[, ] *(?<g>[0-9]+) *[, ] *(?<b>[0-9]+)( *[,/] *(?<a>[0-9.]+%?))?\)$/i;
const hslMatcher = /^hsla?\( *(?<h>[0-9.]+ *(deg|grad|rad|turn)?) *[, ] *(?<s>[0-9.]+%?) *[, ] *(?<l>[0-9.]+%?)( *[,/] *(?<a>[0-9.]+%?))? *\)$/i;
const hsvMatcher = /^hsva?\( *(?<h>[0-9.]+ *(deg|grad|rad|turn)?) *[, ] *(?<s>[0-9.]+%?) *[, ] *(?<v>[0-9.]+%?)( *[,/] *(?<a>[0-9.]+%?))? *\)$/i;

// clamper helper functions
const c100 = n => Math.max(0, Math.min(100, n));
const c255 = n => Math.max(0, Math.min(255, n));

function parseColor(colorString) {
    colorString = colorString.trim().replace(/\s+/g, ' ');

    if(colorString.match(rgbMatcher)) {
        let {r, g, b, a='1'} = colorString.match(rgbMatcher).groups;
        return {
            r: c255(+r),
            g: c255(+g),
            b: c255(+b),
            a: c255(Math.floor(parsePercent(a) * 255)),
        };

    }else if(colorString.match(hexMatcher)) {
        const {r, g, b, a = 'ff'} = colorString.match(hexMatcher).groups;
        return {
            r: parseInt(r, 16),
            g: parseInt(g, 16),
            b: parseInt(b, 16),
            a: parseInt(a, 16),
        };

    }else if(colorString.match(hexShortMatcher)) {
        const {r, g, b, a = 'f'} = colorString.match(hexShortMatcher).groups;
        return {
            r: parseInt(r + r, 16),
            g: parseInt(g + g, 16),
            b: parseInt(b + b, 16),
            a: parseInt(a + a, 16),
        };

    }else if(colorString.match(hslMatcher)) {
        let {h, s, l, a='1'} = colorString.match(hslMatcher).groups;
        s = parsePercent(s) * 100;
        l = parsePercent(l) * 100;
        let v = l + s * Math.min(+l, 100 - l) / 100;
        return {
            h: parseHue(h),
            s: c100(parsePercent(s)),
            v: c100(v),
            a: c255(Math.floor(parsePercent(a) * 255)),
        };

    }else if(colorString.match(hsvMatcher)) {
        let {h, s, v, a='1'} = colorString.match(hsvMatcher).groups;
        s = parsePercent(s) * 100;
        v = parsePercent(v) * 100;
        a = (a == undefined) ? 1.0 : parsePercent(a);
        return {
            h: parseHue(h),
            s: c100(s),
            v: c100(v),
            a: c255(Math.floor(parsePercent(a) * 255)),
        };

    }else{
        console.log(`rejected ${colorString}`);
        return null;
    }
}

function formatDecimal(n, digits) {
    return n.toFixed(digits).replace(/(\.[^0]*)0+$/, '$1').replace(/\.$/, '');
}


export class Color{
    // Internal _value is always one of:
    //     {
    //         r: [0, 255] by 1.0
    //         g: [0, 255] by 1.0
    //         b: [0, 255] by 1.0
    //         a: [0, 255] by 1.0
    //     }
    // or
    //     {
    //         h: [0, 360] by 1.0
    //         s: [0, 100] by 0.1
    //         v: [0, 100] by 0.1
    //         a: [0, 255] by 1.0
    //     }
    constructor(v) {
        if(v instanceof Color) {
            this._value = {...v._value};
        }else if(
            v instanceof Object
            && (
                ('r' in v && 'g' in v && 'b' in v && 'a' in v)
                || ('h' in v && 's' in v && 'v' in v && 'a' in v)
            )
        ) {
            if('r' in v) {
                this._value = {r: v.r, g: v.g, b: v.b, a: v.a};
            }else{
                this._value = {h: v.h, s: v.s, v: v.v, a: v.a};
            }
        }else{
            this._value = parseColor(v);
            if(!this._value) throw `Cannot parse color ${v}`;
        }

        // round values
        for(const [k, v] of Object.entries(this._value)) {
            this._value[k] = function() {
                switch(k) {
                    case 'r': return Math.round(v);
                    case 'g': return Math.round(v);
                    case 'b': return Math.round(v);
                    case 'h': return Math.round(v);
                    case 's': return Math.round(v * 10) / 10;
                    case 'v': return Math.round(v * 10) / 10;
                    case 'a': return Math.round(v);
                    default: return v;
                }
            }();
        }
    }

    set(props) {
        // returns a new color with specified components set.
        // will auto-convert between rgb and hsv.
        if('r' in props || 'g' in props || 'b' in props) {
            return new Color({
                ...this._valueAsRgb(),
                ...props,
            });
        }else if('h' in props || 's' in props || 'v' in props) {
            return new Color({
                ...this._valueAsHsv(),
                ...props,
            });
        }else{
            // just updating a, don't switch format.
            return new Color({
                ...this._value,
                ...props,
            });
        }
    }

    _valueAsHsv() {
        if('h' in this._value) {
            return this._value;
        }else{
            let h, s, v;
            let {r, g, b, a} = this._value;
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
            return {
                h: +h.toFixed(0),
                s: +s.toFixed(1),
                v: +v.toFixed(1),
                a: a,
            };
        }
    }

    _valueAsRgb() {
        if('r' in this._value) {
            return this._value;
        }else{
            let {h, s, v, a} = this._value;
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
            const [r, g, b] = withoutM.map(v => v + m).map(v => v*255).map(Math.round);
            return {r, g, b, a};
        }
    }

    get r() { return this._valueAsRgb().r; }
    get g() { return this._valueAsRgb().g; }
    get b() { return this._valueAsRgb().b; }
    get h() { return this._valueAsHsv().h; }
    get s() { return this._valueAsHsv().s; }
    get v() { return this._valueAsHsv().v; }
    get a() { return this._value.a; }

    get hex() {
        const {r, g, b, a} = this._valueAsRgb();
        return (
            '#'
            + [r, g, b, a]
                .map(v => v.toString(16).padStart(2, '0'))
                .join('')
                .replace(/ff$/, '')
                .toLowerCase()
        );
    }

    get rgb() {
        const {r, g, b, a} = this._valueAsRgb();
        if(a == 255) {
            return 'rgb(' + [r, g, b].map(a => ~~a).join(' ') + ')';
        }else{
            return 'rgb(' + [r, g, b].map(a => ~~a).join(' ') + ' / ' + formatDecimal(a / 255 * 100, 1) + '%)';
        }
    }

    get rgbCommas() {
        const {r, g, b, a} = this._valueAsRgb();
        if(a == 255) {
            return 'rgb(' + [r, g, b].map(a => ~~a).join(', ') + ')';
        }else{
            return 'rgba(' + [r, g, b].map(a => ~~a).join(', ') + ', ' + formatDecimal(a / 255 * 100, 1) + '%)';
        }
    }

    get hsl() {
        const {h, s, v, a} = this._valueAsHsv();
        const l = (v - v * s / 200);
        const newS = (l == 0 || l == 100) ? 0 : 100 * (v - l) / Math.min(l, 100 - l);
        if(this.a == 255) {
            return 'hsl(' + h + ' ' + newS.toFixed(1) + '% ' + l.toFixed(1) + '%)';
        }else{
            return 'hsl(' + h + ' ' + newS.toFixed(1) + '% ' + l.toFixed(1) + '% / ' + formatDecimal(a/255 * 100, 1) + '%)';
        }
    }

    toString() {
        return this.hex;
    }

    toHsv() {
        return new Color(this._valueAsHsv());
    }

    toRgb() {
        return new Color(this._valueAsRgb());
    }

    isDark(threshold=35) {
        // returns whether light colors contrast better with this color
        return this.v - 0.5 * this.s <= threshold;
    }

    getTextColor() {
        // return a contrasting color for text on top of this color
        return this.isDark() ? '#fff' : '#000';
    }

    lerp(colorB, f) {
        // return linear iterpolation of this -> colorB at f
        if(f <= 0) {
            return new Color(this);
        }else if(f >= 1) {
            return new Color(colorB);
        }else{
            const a = this._valueAsRgb();
            const b = colorB._valueAsRgb();
            return new Color({
                r: c255(Math.round(a.r * (1 - f) + b.r * f)),
                g: c255(Math.round(a.g * (1 - f) + b.g * f)),
                b: c255(Math.round(a.b * (1 - f) + b.b * f)),
                a: c255(Math.round(a.a * (1 - f) + b.a * f)),
            });
        }
    }
}
