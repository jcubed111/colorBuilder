function mod(a, b) {
    return a - b * Math.floor(a / b);
}
function maxBy(arr, iteratee) {
    return arr.reduce(([prevItem, prevRank], newItem) => {
        let newRank = iteratee(newItem);
        if(newRank > prevRank) {
            return [newItem, newRank];
        }else{
            return [prevItem, prevRank];
        }
    }, [undefined, -Infinity])[0];
}
function angleSub(angle1, angle2) {
    const diff = (angle1 - angle2 + 180) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
}

function formatDecimal(n, digits) {
    return n.toFixed(digits).replace(/(\.[^0]*)0+$/, '$1').replace(/\.$/, '');
}

function rgb(r, g, b, a=255) {
    return 'rgba(' + [r, g, b].map(a => ~~a).join(',') + ',' + (a/255) + ')';
}

function hsv(h, s, v, a=255) {
    const l = (v - v*s/200);
    const newS = (l == 0 || l == 100) ? 0 : 100 * (v - l) / Math.min(l, 100 - l);
    return 'hsla(' + h + ',' + newS + '%,' + l + '%,' + (a/255) + ')';
}

function hex(r, g, b, a=255) {
    return '#' + [r, g, b, a].map(v => v.toString(16).padStart(2, '0')).join('').replace(/ff$/, '').toLowerCase();
}

function prettyRgb(r, g, b, a=255) {
    if(a == 255) {
        return 'rgb(' + [r, g, b].map(a => ~~a).join(', ') + ')';
    }else{
        return 'rgba(' + [r, g, b].map(a => ~~a).join(', ') + ', ' + formatDecimal(a/255, 2) + ')';
    }
}

function prettyHsv(h, s, v, a=255) {
    const l = (v - v*s/200);
    const newS = (l == 0 || l == 100) ? 0 : 100 * (v - l) / Math.min(l, 100 - l);
    if(a == 255) {
        return 'hsl(' + h + ', ' + newS.toFixed(1) + '%, ' + l.toFixed(1) + '%)';
    }else{
        return 'hsla(' + h + ', ' + newS.toFixed(1) + '%, ' + l.toFixed(1) + '%, ' + formatDecimal(a/255, 2) + ')';
    }
}

async function toastSuccess(button) {
    let el = document.createElement('div');
    el.className = 'buttonSuccessToast';
    el.innerHTML = '<i class="fal fa-clipboard-check"></i>';
    button.appendChild(el);
    await new Promise(resolve => setTimeout(resolve, 500));
    el.classList.add('fade');
    await new Promise(resolve => setTimeout(resolve, 500));
    el.remove();
}

function colorsToBgImage(colors, smooth=true, dir='to bottom') {
    if(smooth) {
        return `
            linear-gradient(${dir}, ${colors.join(',')}),
            url(checkers.png)
        `;
    }else{
        let colorStops = [];
        for(let i = 0; i < colors.length + 1; i++) {
            colorStops.push([colors[i - 1], colors[i]].filter(c => c));
        }
        return `
            linear-gradient(${dir}, ${
                colorStops.flatMap((stops, i, l) =>
                    stops.map(c =>
                        `${c} ${i * 100 / (colorStops.length - 1)}%`
                    )
                ).join(',')
            }),
            url(checkers.png)
        `;
    }
}

const hexMatcher = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
const hexShortMatcher = /^#?([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i;
const rgbMatcher = /^rgba?\(([0-9]+),([0-9]+),([0-9]+)(,([0-9.]+%?))?\)$/i;
const hslMatcher = /^hsla?\(([0-9]+),([0-9.]+%?),([0-9.]+%?)(,([0-9.]+%?))?\)$/i;
const hsvMatcher = /^hsva?\(([0-9]+),([0-9.]+%?),([0-9.]+%?)(,([0-9.]+%?))?\)$/i;

function convertPercent(string) {
    if(/%$/.test(string)) {
        return string.substr(string, string.length - 1) / 100;
    }else{
        return +string;
    }
}

function parseColor(colorString) {
    colorString = colorString.replace(/\s/g, '');

    const color = new Color();

    if(colorString.match(rgbMatcher)) {
        let [, r, g, b, , a] = colorString.match(rgbMatcher);
        a = (a == undefined) ? 1.0 : convertPercent(a);
        color.setRgb(+r, +g, +b, ~~(255*a));

    }else if(colorString.match(hexMatcher)) {
        let [, ...nums] = colorString.match(hexMatcher);
        nums = nums.map(n => n || "ff").map(n => parseInt(n, 16));
        color.setRgb(...nums);

    }else if(colorString.match(hexShortMatcher)) {
        let [, ...nums] = colorString.match(hexShortMatcher);
        nums = nums.map(n => n || "f").map(n => parseInt(n+n, 16));
        color.setRgb(...nums);

    }else if(colorString.match(hslMatcher)) {
        let [, h, s, l, , a] = colorString.match(hslMatcher);
        s = convertPercent(s) * 100;
        l = convertPercent(l) * 100;
        a = (a == undefined) ? 1.0 : convertPercent(a);
        let v = +l + s*Math.min(+l, 100-l)/100;
        color.setHsv(+h, +s, +v, ~~(255*a));

    }else if(colorString.match(hsvMatcher)) {
        let [, h, s, v, , a] = colorString.match(hsvMatcher);
        s = convertPercent(s) * 100;
        v = convertPercent(v) * 100;
        a = (a == undefined) ? 1.0 : convertPercent(a);
        color.setHsv(+h, +s, +v, ~~(255*a));

    }else{
        console.log(`rejected ${colorString}`);
        return false;
    }

    return color;
}

function parseList(colorListString) {
    colorListString = colorListString.replace(/\s/g, '');

    let anyFormatParser = new RegExp(
        [
            rgbMatcher,
            hexMatcher,
            hexShortMatcher,
            hslMatcher,
            hsvMatcher,
        ].map(r => `(${r.source.replace(/^\^|\$$/g, '')})`).join('|'),
        'ig',
    );

    let matches = colorListString.match(anyFormatParser);

    return matches.map(s => parseColor(s));
}
