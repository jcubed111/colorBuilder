class GradientController extends View{
    el() {
        return document.getElementById('gradientController');
    }

    constructor(editColor) {
        super();
        this.editColor = editColor;
        this.subViews = [];
        this.previewMode = 'gradient'; // gradient, swatches, bars, random
        this.addSubView(0);
        this.setActiveView(this.subViews[0]);
        this.reorderSubViews();

        this.editColor.onChange(_ => this.triggerChange());
    }

    setActiveView(v) {
        this.subViews.forEach(s => s.setActive(s == v));
        this.editColor.pointTo(v.targetColor);
    }

    reorderSubViews() {
        this.subViews.forEach(v => {
            this.el.appendChild(v.el);
        });
    }

    addSubView(insertIndex, color = null) {
        if(!color) {
            if(this.subViews.length == 0) {
                color = new Color();
            }else if(insertIndex == 0) {
                color = this.subViews[0].targetColor.clone();
            }else if(insertIndex == this.subViews.length) {
                color = this.subViews[this.subViews.length - 1].targetColor.clone();
            }else{
                const [a, b] = this.subViews.slice(insertIndex-1, insertIndex+1).map(v => v.targetColor);
                color = new Color();
                color.setR((a.r() + b.r())>>1);
                color.setG((a.g() + b.g())>>1);
                color.setB((a.b() + b.b())>>1);
                color.setA((a.a() + b.a())>>1);
            }
        }
        const v = new GradientSwatch(this, color);
        this.subViews.splice(insertIndex, 0, v);
        this.reorderSubViews();
        this.setActiveView(v);
        this.render();
        this.triggerChange();
    }

    addMultiSubView(insertIndex) {
        let num = prompt("How many would you like to add?", 1);
        if(num == null || num < 1) return;
        num = +num;

        const [a, b] = this.subViews.slice(insertIndex-1, insertIndex+1).map(v => v.targetColor);

        let colors = Array(num).fill(0).map((_, i) => {
            let factor = (i + 1) / (num + 1);
            let color = new Color();
            color.setR(Math.round(a.r() * (1.0 - factor) + b.r() * factor));
            color.setG(Math.round(a.g() * (1.0 - factor) + b.g() * factor));
            color.setB(Math.round(a.b() * (1.0 - factor) + b.b() * factor));
            color.setA(Math.round(a.a() * (1.0 - factor) + b.a() * factor));
            return color;
        });

        colors.forEach((c, i) => this.addSubView(insertIndex + i, c));
    }

    removeSubView(v) {
        if(this.subViews.length == 1) return;
        let i = this.subViews.indexOf(v);
        this.subViews.splice(i, 1);
        v.remove();

        if(v.isActive) {
            this.setActiveView(this.subViews[i] || this.subViews[i-1]);
        }
        this.reorderSubViews();
        this.render();
        this.triggerChange();
    }

    setToColors(colors) {
        if(colors.length < 1) return;
        colors.forEach((c, i) => this.addSubView(i, c));
        while(this.subViews.length > colors.length) {
            this.removeSubView(this.subViews[colors.length]);
        }
        this.setActiveView(this.subViews[0]);
    }

    render() {}

    getColors() {
        return this.subViews.map(v => v.targetColor.clone());
    }

    toColorSet() {
        return new ColorSet([this.getColors()]);
    }
}

class GradientSwatch extends View {
    el() {
        return View.fromTemplate('gradientSwatch');
    }

    constructor(parent, color) {
        super();
        this.parent = parent;
        this.targetColor = color;
        this.colorListener = this.targetColor.onChange(c => this.render(c));
        this.render();

        this.$('.addBefore').addEventListener('click', e => {
            this.parent.addSubView(this.getIndex());
            e.stopPropagation();
        });
        this.$('.addAfter').addEventListener('click', e => {
            this.parent.addSubView(this.getIndex() + 1);
            e.stopPropagation();
        });
        this.$('.addMultiBefore').addEventListener('click', e => {
            this.parent.addMultiSubView(this.getIndex());
            e.stopPropagation();
        });
        this.$('.duplicate').addEventListener('click', e => {
            this.parent.addSubView(this.getIndex(), this.targetColor.clone());
            e.stopPropagation();
        });
        this.$('.delete').addEventListener('click', e => {
            this.parent.removeSubView(this);
            e.stopPropagation();
        });
        this.el.addEventListener('click', e => {
            this.parent.setActiveView(this);
        });
    }

    remove() {
        this.targetColor.offChange(this.colorListener);
        super.remove();
    }

    getIndex() {
        return this.parent.subViews.indexOf(this);
    }

    render() {
        const c = this.targetColor.toString();
        this.el.style.background = `
            linear-gradient(${c}, ${c}),
            url(checkers.png)`;
        this.el.style.color = this.targetColor.getTextColor();
        this.parent.render();
    }

    setActive(active) {
        this.el.classList.toggle('active', active);
        this.isActive = active;
    }
}
