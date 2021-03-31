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

function parseColor(colorString) {
    colorString = colorString.replace(/\s/g, '');

    let rgbMatcher = /^rgba?\(([0-9]+),([0-9]+),([0-9]+)(,([0-9.]+)%?)?\)$/i;
    let hexMatcher = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i;
    let hexShortMatcher = /^#?([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i;
    let hslMatcher = /^hsla?\(([0-9]+),([0-9.]+)%?,([0-9.]+)%?(,([0-9.]+)%?)?\)$/;

    const color = new Color();

    if(colorString.match(rgbMatcher)) {
        let [, r, g, b, , a] = colorString.match(rgbMatcher);
        color.setRgb(+r, +g, +b, a == undefined ? 255 : ~~(255*a));

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
        let v = +l + s*Math.min(+l, 100-l)/100;
        color.setHsv(+h, +s, +v, a == undefined ? 255 : ~~(255*a));

    }else{
        console.log(`rejected ${colorString}`);
        return false;
    }

    return color;
}
