class GridController extends View{
    el() {
        return document.getElementById('gridController');
    }

    constructor(colorPointer) {
        super();
        this.colorPointer = colorPointer;
        this.colorGrid = new ColorGrid(3, 3);

        this.subViews = [];

        this.colorGrid.onChange(e => this.render());
        this.render();
    }

    initSubViews() {
        this.subViews.forEach(v => v.remove());
        this.subViews = [];

        this.colorGrid.forEachPos(([x, y], value) => {
            this.subViews.push(
                new GridSwatchController([x, y], this.colorGrid, this.colorPointer),
            );
        });

        while(this.$('.elementArea').firstChild) {
            this.$('.elementArea').firstChild.remove();
        }

        this.subViews.forEach(v => this.$('.elementArea').appendChild(v.el));

        // add grid expansion and deletion buttons
        if(this.width > 1) { // don't delete the last column
            for(let x = 0; x < this.width; x++) {
                this.addRowControl(x, false);
            }
        }
        if(this.height > 1) { // don't delete the last row
            for(let y = 0; y < this.height; y++) {
                this.addRowControl(y, true);
            }
        }
        for(let x = 0; x < this.width + 1; x++) {
            // we adjust to avoid corner elements hitting
            let adjustedX = x == 0 ? 0.2 : x;
            this.addGapControl(adjustedX, false);
        }
        for(let y = 0; y < this.height + 1; y++) {
            // we adjust to avoid corner elements hitting
            let adjustedY = y == this.height ? y - 0.2 : y;
            this.addGapControl(adjustedY, true);
        }
    }

    _setupRowGapEl(el, index, visualIndex, isHorizontal) {
        el.classList.toggle('horizontal', isHorizontal);
        el.classList.toggle('vertical', !isHorizontal);
        el.style[isHorizontal ? 'bottom' : 'left'] = `${visualIndex}em`;
        this.$('.elementArea').appendChild(el);
    }

    addRowControl(index, isHorizontal) {
        const el = View.fromTemplate('gridRowControl');
        this._setupRowGapEl(el, index, index, isHorizontal);
        el.addEventListener('click', e => {
            if(isHorizontal) {
                this.removeRowAt(index);
            }else{
                this.removeColumnAt(index);
            }
            e.stopPropagation();
        });
    }

    addGapControl(index, isHorizontal) {
        const el = View.fromTemplate('gridGapControl');
        this._setupRowGapEl(el, index, index - 0.5, isHorizontal);
        el.addEventListener('click', e => {
            if(isHorizontal) {
                this.addRowBefore(index);
            }else{
                this.addColumnBefore(index);
            }
            e.stopPropagation();
        });
    }

    resetTo(...args) {
        this.colorGrid.resetTo(...args);
        this.ensureActiveColor();
    }

    removeRowAt(i) {
        if(this.height < 2) return;
        let colors = this.colorGrid.getColorArray2d();
        colors.forEach(col => col.splice(i, 1));
        this.resetTo(colors);
    }
    removeColumnAt(i) {
        if(this.width < 2) return;
        let colors = this.colorGrid.getColorArray2d();
        colors.splice(i, 1);
        this.resetTo(colors);
    }
    addRowBefore(i) {
        let colors = this.colorGrid.getColorArray2d();
        colors.forEach(col => col.splice(i, 0, null));
        this.resetTo(colors);
    }
    addColumnBefore(i) {
        let colors = this.colorGrid.getColorArray2d();
        colors.splice(i, 0, colors[0].map(_ => null));
        this.resetTo(colors);
    }

    ensureActiveColor() {
        // if none of the colors in the grid are the active color,
        // change the active color.
        if(!this.colorGrid.getDefinedColors().some(
            ([x, y, color]) => this.colorPointer.isPointingTo(color)
        )) {
            let [x, y, targetColor] = this.colorGrid.getDefinedColors()[0];
            this.colorPointer.pointTo(targetColor);
        }
    }

    render() {
        if(this.width != this.colorGrid.width || this.height != this.colorGrid.height) {
            this.renderResize();
        }
        this.renderBlend();
    }

    renderResize() {
        this.width = this.colorGrid.width;
        this.height = this.colorGrid.height;

        this.initSubViews();

        this.$('.elementArea').style.width = `${this.colorGrid.width - 1}em`;
        this.$('.elementArea').style.height = `${this.colorGrid.height - 1}em`;

        // We pull the grid square from the css font-size property. This
        // allow sus to position sub elements using em units.
        // But we need it here to set the canvas size manually.
        let gridSize = parseInt(getComputedStyle(this.el).getPropertyValue('font-size'));
        this.$('#gridRenderCanvas').width = (this.colorGrid.width - 1) * gridSize;
        this.$('#gridRenderCanvas').height = (this.colorGrid.height - 1) * gridSize;
    }

    renderBlend() {
        // renders the color blend background
        const renderer = new GridRenderer(this.colorGrid.toColorSet(), this.$('#gridRenderCanvas'));
        renderer.render();
    }
}

class GridSwatchController extends View{
    el() {
        return View.fromTemplate('gridSwatch');
    }

    constructor([x, y], colorGrid, colorPointer) {
        super();

        this.x = x;
        this.y = y;
        this.colorGrid = colorGrid;
        this.colorPointer = colorPointer;

        colorPointer.onChange(_ => this.render());
        this.gridListener = colorGrid.onChange(_ => this.render());
        this.render();

        this.el.addEventListener('click', e => {
            this.select(e);
            e.stopPropagation();
        });
        this.el.addEventListener('dblclick', e => {
            this.unlock(e);
            e.stopPropagation();
        });
    }

    remove() {
        this.colorGrid.offChange(this.parentListener);
        super.remove();
    }

    select(e) {
        // set this color as the active color
        if(this.colorGrid.at(this.x, this.y) === null) {
            this.colorGrid.initSwatch(this.x, this.y);
        }
        this.colorPointer.pointTo(this.colorGrid.at(this.x, this.y));
    }

    unlock(e) {
        // don't allow unlock if we're the only color left
        if(this.colorGrid.getDefinedColors().length <= 1) {
            return;
        }
        // if this color is not null, set it to null
        this.colorGrid.unlockSwatch(this.x, this.y);

        GridController.prototype.ensureActiveColor.apply(this);
    }

    render() {
        let color = this.colorGrid.at(this.x, this.y);
        this.el.classList.toggle('unlocked', color == null);
        this.el.classList.toggle('active', this.colorPointer.isPointingTo(color));
        this.el.classList.toggle('light',
            (
                color
                || this.colorGrid.extrapolatedAt(this.x, this.y)
                || new Color()
            ).useLightContrast(),
        );

        this.el.style.left = `${this.x}em`;
        this.el.style.bottom = `${this.y}em`;

        if(color != null) {
            this.el.style.backgroundImage = `
                linear-gradient(${color}, ${color}),
                url(checkers.png)`;
        }else{
            this.el.style.backgroundImage = "";
        }
    }
}
