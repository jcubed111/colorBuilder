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
    return '#' + [r, g, b, a].map(v => v.toString(16).padStart(2, '0')).join('').replace(/ff$/, '').toUpperCase();
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
