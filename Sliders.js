class RGBSlider extends View{
    el() {
        return View.fromTemplate('sliderTemplate');
    }

    max() {
        return 255;
    }

    sliderHeight() {
        return this.max() + 1;
    }

    constructor(targetColor) {
        super();
        this.targetColor = targetColor;

        this._dragging = false;
        this._dontUpdateInput = false;

        this.$topper = this.$('.topper');
        this.$numberInput = this.$('.numberBox');
        this.$sliderOuter = this.$('.sliderOuter');
        this.$sliderInner = this.$('.sliderInner');
        this.$sliderMarker = this.$('.sliderMarker');

        this.setHeight();

        this.bindListeners();
        this.targetColor.onChange(_ => this.updateView());
        this.updateView();
    }

    setHeight() {
        this.$sliderInner.style.height = this.max() + 1 + 'px';
    }

    bindListeners() {
        this.$('.sliderOuter').addEventListener('mousedown', e => {
            this._dragging = true;
            this._sliderMove(e);
            e.preventDefault();
        });
        this.el.addEventListener('mouseup', e => {
            this._dragging = false;
            e.preventDefault();
        });
        this.el.addEventListener('mouseleave', e => {
            this._dragging = false;
            e.preventDefault();
        });
        this.$('.sliderOuter').addEventListener('mousemove', e => {
            if(this._dragging) this._sliderMove(e);
            e.preventDefault();
        });
        this.el.addEventListener('wheel', e => this.wheel(e));
        this.$('.arrowUp').addEventListener('click', e => this.wheel(e, 1));
        this.$('.arrowDown').addEventListener('click', e => this.wheel(e, -1));
        this.$('.numberBox').addEventListener('input', e => {
            this._setValue(+this.$('.numberBox').value, false);
            e.preventDefault();
        });
        this.$('.numberBox').addEventListener('blur', e => {
            this._setValue(this.getValue());
        });
        this.$('.numberBox').addEventListener('keydown', e => {
            let v = 0;
            if(e.key == 'ArrowUp') {
                v = 1;
            }else if(e.key == 'ArrowDown') {
                v = -1;
            }else{
                return;
            }
            this._setValue(this.getValue() + v);
            e.preventDefault();
        });
    }

    wheel(e, value=0) {
        e.preventDefault();
        const v = value || -Math.sign(e.deltaY);
        this._setValue(this.getValue() + v);
    }

    getValue() {
        throw '???';
    }

    setValue(v) {
        throw '???';
    }

    _setValue(v, changeInputBoxNumber = true) {
        this._dontUpdateInput = !changeInputBoxNumber;
        this.setValue(Math.max(0, Math.min(this.max(), v)));
        this._dontUpdateInput = false;
    }

    updateView() {
        if(!this._dontUpdateInput) {
            const start = this.$numberInput.selectionStart;
            const end = this.$numberInput.selectionEnd;
            this.$numberInput.value = this.getValue();
            this.$numberInput.setSelectionRange(start, end);
        }
        this.$sliderMarker.style.top = this.sliderHeight() - 1 - this.getValue() + 'px';
        this.setBackgrounds();
    }

    _sliderMove(e) {
        const y = e.clientY - this.$sliderInner.getBoundingClientRect().top;
        this._setValue(this.sliderHeight() - 1 - y);
    }

    setBackgrounds() {
        throw '???';
    }
}

class RedSlider extends RGBSlider{
    getValue() { return this.targetColor.r(); }
    setValue(v) { this.targetColor.setR(v); }

    setBackgrounds() {
        this.$topper.style.background = rgb(this.getValue(), 0, 0);
        this.$sliderInner.style.background = `linear-gradient(${rgb(255, this.targetColor.g(), this.targetColor.b())}, ${rgb(0, this.targetColor.g(), this.targetColor.b())})`;
    }
}

class GreenSlider extends RGBSlider{
    getValue() { return this.targetColor.g(); }
    setValue(v) { this.targetColor.setG(v); }

    setBackgrounds() {
        this.$topper.style.background = rgb(0, this.getValue(), 0);
        this.$sliderInner.style.background = `linear-gradient(${rgb(this.targetColor.r(), 255, this.targetColor.b())}, ${rgb(this.targetColor.r(), 0, this.targetColor.b())})`;
    }
}

class BlueSlider extends RGBSlider{
    getValue() { return this.targetColor.b(); }
    setValue(v) { this.targetColor.setB(v); }

    setBackgrounds() {
        this.$topper.style.background = rgb(0, 0, this.getValue());
        this.$sliderInner.style.background = `linear-gradient(${rgb(this.targetColor.r(), this.targetColor.g(), 255)}, ${rgb(this.targetColor.r(), this.targetColor.g(), 0)})`;
    }
}

class AlphaSlider extends RGBSlider{
    getValue() { return this.targetColor.a(); }
    setValue(v) { this.targetColor.setA(v); }

    setBackgrounds() {
        this.$topper.style.background = rgb(this.targetColor.r(), this.targetColor.g(), this.targetColor.b(), this.getValue());
        this.$sliderInner.style.background = `linear-gradient(${rgb(this.targetColor.r(), this.targetColor.g(), this.targetColor.b(), 255)}, ${rgb(this.targetColor.r(), this.targetColor.g(), this.targetColor.b(), 0)}), url(checkers.png)`;
    }
}

class HueSlider extends RGBSlider{
    max() { return 360; }
    getValue() { return this.targetColor.h(); }
    setValue(v) { this.targetColor.setH(v); }

    wheel(e, value=0) {
        e.preventDefault();
        const v = value || -Math.sign(e.deltaY);
        this._setValue((this.getValue() + v + 360) % 360);
    }

    setBackgrounds() {
        this.$topper.style.background = hsv(this.getValue(), 100, 100);
        let g = `linear-gradient(to top,
            ${hsv(0, this.targetColor.s(), this.targetColor.v())}   0.00000%,
            ${hsv(60, this.targetColor.s(), this.targetColor.v())}  16.66667%,
            ${hsv(120, this.targetColor.s(), this.targetColor.v())} 33.33333%,
            ${hsv(180, this.targetColor.s(), this.targetColor.v())} 50.00000%,
            ${hsv(240, this.targetColor.s(), this.targetColor.v())} 66.66667%,
            ${hsv(300, this.targetColor.s(), this.targetColor.v())} 83.33333%,
            ${hsv(360, this.targetColor.s(), this.targetColor.v())} 100.00000%
        )`;
        this.$sliderInner.style.background = g;
    }
}

class SatSlider extends RGBSlider{
    max() { return 100; }
    getValue() { return this.targetColor.s(); }
    setValue(v) { this.targetColor.setS(v); }

    setBackgrounds() {
        this.$topper.style.background = hsv(this.targetColor.h(), this.getValue(), this.targetColor.v());
        let g = `linear-gradient(
            ${hsv(this.targetColor.h(), 100, this.targetColor.v())},
            ${hsv(this.targetColor.h(), 0, this.targetColor.v())}
        )`;
        this.$sliderInner.style.background = g;
    }
}

class ValSlider extends RGBSlider{
    max() { return 100; }
    getValue() { return this.targetColor.v(); }
    setValue(v) { this.targetColor.setV(v); }

    setBackgrounds() {
        this.$topper.style.background = hsv(0, 0, this.getValue());
        let g = `linear-gradient(
            ${hsv(this.targetColor.h(), this.targetColor.s(), 100)},
            ${hsv(this.targetColor.h(), this.targetColor.s(), 0)}
        )`;
        this.$sliderInner.style.background = g;
    }
}

class SatValSlider extends RGBSlider{
    el() {
        return document.getElementById('satValSlider');
    }

    setHeight() {}

    bindListeners() {
        this.$('.sliderOuter').addEventListener('mousedown', e => {
            this._dragging = true;
            this._sliderMove(e);
            e.preventDefault();
        });
        this.el.addEventListener('mouseup', e => {
            this._dragging = false;
            e.preventDefault();
        });
        this.el.addEventListener('mouseleave', e => {
            this._dragging = false;
            e.preventDefault();
        });
        this.el.addEventListener('mousemove', e => {
            if(this._dragging) this._sliderMove(e);
            e.preventDefault();
        });
        this.el.addEventListener('wheel', e => {
            e.preventDefault();
            const v = -Math.sign(e.deltaY);
            let vx = 0, vy = 0;
            if(e.shiftKey) { vx = -v; } else { vy = v; }
            this._setValue(this.getValue()[0] + vx, this.getValue()[1] + vy);
        });
    }

    _sliderMove(e) {
        const y = e.clientY - this.$sliderInner.getBoundingClientRect().top;
        const height = this.$sliderInner.getBoundingClientRect().height;
        const x = e.clientX - this.$sliderInner.getBoundingClientRect().left;
        const width = this.$sliderInner.getBoundingClientRect().width;
        this._setValue(x/(width-1) * 100, 100 - y/(height-1) * 100);
    }

    getValue() {
        return [this.targetColor.s(), this.targetColor.v()];
    }

    setValue(s, v) {
        this.targetColor.setS(s)
        this.targetColor.setV(v);
    }

    _setValue(s, v) {
        s = Math.max(0, Math.min(100, +s.toFixed(1)));
        v = Math.max(0, Math.min(100, +v.toFixed(1)));
        this.setValue(s, v);
    }

    updateView() {
        let [s, v] = this.getValue();
        const height = this.$sliderInner.getBoundingClientRect().height;
        const width = this.$sliderInner.getBoundingClientRect().width;
        this.$sliderMarker.style.top = height - this.getValue()[1]*0.01*height + 'px';
        this.$sliderMarker.style.left = this.getValue()[0]*0.01*width + 'px';
        this.setBackgrounds();
    }

    setBackgrounds() {
        this.$sliderMarker.style.borderColor = this.targetColor.getTextColor();
        this.$sliderInner.style.backgroundColor = hsv(this.targetColor.h(), 100, 100);
    }
}

class ColorView extends View{
    el() {
        return document.getElementById('mainColorDisplay');
    }

    constructor(targetColor) {
        super();
        this.targetColor = targetColor;

        this.targetColor.onChange(_ => this.updateView());
        this.updateView();
    }

    updateView() {
        this.$('.solid').style.background = rgb(this.targetColor.r(), this.targetColor.g(), this.targetColor.b(), 255);
        this.$('.alpha').style.background = rgb(this.targetColor.r(), this.targetColor.g(), this.targetColor.b(), this.targetColor.a());
    }
}

class InputView extends View{
    el() {
        return document.getElementById('mainInput');
    }

    constructor(targetColor) {
        super();
        this.targetColor = targetColor;

        this.targetColor.onChange(_ => this.updateView());
        this.updateView();

        // TODO: handle user typing in the boxes
        ['#hexInput', '#rgbInput', '#hslInput'].forEach(selector => {
            this.$(selector).addEventListener('focus', e => {
                this.backupColor = this.targetColor.toString();
            });
            this.$(selector).addEventListener('keydown', e => {
                if(e.key == 'Escape') {
                    this.parseAndSet(this.backupColor);
                }
            });
            this.$(selector).addEventListener('input', e => {
                const valid = this.parseAndSet(this.$(selector).value, selector);
                this.$(selector).classList.toggle('invalid', !valid);
            });
        });

        ['hex', 'rgb', 'hsl'].forEach(t => {
            this.$(`.${t} .copyButton`).addEventListener('click', e => {
                const buttonEl = e.currentTarget;
                this.$(`#${t}Input`).select();
                document.execCommand("copy");
                toastSuccess(buttonEl);
            });
        });
        this.el.querySelectorAll('.pasteButton').forEach(el => el.addEventListener('click', async e => {
            // this.$(`#hexInput`).select();
            // document.execCommand("paste");
            let v = await navigator.clipboard.readText();
            console.log(v);
            this.parseAndSet(v);
        }));
    }

    parseAndSet(colorString, lockSelector=null) {
        // lockSelector: used to specify that a certain input box shouldn't be
        //   updated when the color changes from this parse
        let parsed = parseColor(colorString);
        if(parsed == false) return false;

        this.lockSelector = lockSelector;
        this.targetColor.setRgb(...parsed._asRgb());
        this.lockSelector = null;
        return true;
    }

    updateView() {
        this.updateInputIfNotLocked('#hexInput', hex(this.targetColor.r(), this.targetColor.g(), this.targetColor.b(), this.targetColor.a()));
        this.updateInputIfNotLocked('#rgbInput', prettyRgb(this.targetColor.r(), this.targetColor.g(), this.targetColor.b(), this.targetColor.a(), 3));
        this.updateInputIfNotLocked('#hslInput', prettyHsv(this.targetColor.h(), this.targetColor.s(), this.targetColor.v(), this.targetColor.a()));
    }

    updateInputIfNotLocked(selector, colorString) {
        if(selector == this.lockSelector) return;
        this.$(selector).value = colorString;
        this.$(selector).classList.remove('invalid');
    }
}
