const rgb, rgba = function(r, g, b, a=1) {
    return {r, g, b, a, toString() {
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }};
}

class Gradient{
    constructor(...colors) {
        this.colors = colors;
    }

    at(i) {
        if(this.colors.length == 0) return null;
        if(this.colors.length == 1) return this.colors[0].toString();
        if(i >= 1) return this.colors[this.colors.length-1].toString();
        if(i <= 0) return this.colors[0].toString();

        i *= this.colors.length - 1;
        let a = Math.floor(i), b = Math.ceil(i), s = i - a, t = 1 - s;
        let colorA = this.colors[a];
        let colorB = this.colors[b];

        let color = rgba(0, 0, 0, 0);
        if(colorA.a + colorB.a != 0) {
            color.a = colorA.a*t + colorB.a*s;
            color.r = (colorA.r*colorA.a*t + colorB.r*colorB.a*s) / (color.a);
            color.g = (colorA.g*colorA.a*t + colorB.g*colorB.a*s) / (color.a);
            color.b = (colorA.b*colorA.a*t + colorB.b*colorB.a*s) / (color.a);
        }
        return color.toString();
    }
}
