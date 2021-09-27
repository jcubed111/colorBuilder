class ModeCopyController extends View{
    el() {
        return document.getElementById('modeCopyController');
    }

    constructor(colorPointer, gradController, gridController) {
        super();
        this.colorPointer = colorPointer;
        this.gradController = gradController;
        this.gridController = gridController;
        this.activeMode = 'gradient';
        this.render();

        this.$('.mode_gradient').addEventListener('click', e =>    this.setMode('gradient'));
        this.$('.mode_grid').addEventListener('click', e =>        this.setMode('grid'));

        this.$('.preview_gradient').addEventListener('click', e => this.setPreview('gradient'));
        this.$('.preview_swatches').addEventListener('click', e => this.setPreview('swatches'));
        this.$('.preview_random').addEventListener('click', e =>   this.setPreview('random'));
        this.$('.preview_bars').addEventListener('click', e =>     this.setPreview('bars'));

        this.$('.copy0x').addEventListener('click', e =>            this.copyAs(e, '0x', '', ', '));
        this.$('.copyPound').addEventListener('click', e =>         this.copyAs(e, '#',  '', ', '));
        this.$('.copyPoundQ').addEventListener('click', e =>        this.copyAs(e, '#', '"', ', '));
        this.$('.copyPoundNewline').addEventListener('click', e =>  this.copyAs(e, '#',  '', '\n'));

        this.$('.copy2dArray0x').addEventListener('click', e =>     this.copyAs(e, '0x', '', ', ', 'array2d'));
        this.$('.copy2dArrayPound').addEventListener('click', e =>  this.copyAs(e, '#',  '', ', ', 'array2d'));
        this.$('.copy2dArrayPoundQ').addEventListener('click', e => this.copyAs(e, '#', '"', ', ', 'array2d'));
        this.$('.copyVisualGrid').addEventListener('click', e =>    this.copyAs(e, '#',  '', ' ',  'visualGrid'));
    }

    render() {
        ['gradient', 'grid'].forEach(m => {
            this.$('.mode_' + m).classList.toggle('active', this.activeMode == m);
        });
        ['gradient', 'swatches', 'random', 'bars'].forEach(m => {
            this.$('.preview_' + m).classList.toggle('active', this.gradController.previewMode == m);
        });
        this.gradController.el.classList.toggle('hidden', this.activeMode != 'gradient');
        this.gridController.el.classList.toggle('hidden', this.activeMode != 'grid');

        this.renderVisibleCopyButtons();
    }

    renderVisibleCopyButtons() {
        [
            ['.copy0x',            'gradient'],
            ['.copyPound',         'gradient'],
            ['.copyPoundQ',        'gradient'],
            ['.copyPoundNewline',  'gradient'],
            ['.copy2dArray0x',     'grid'],
            ['.copy2dArrayPound',  'grid'],
            ['.copy2dArrayPoundQ', 'grid'],
            ['.copyVisualGrid',    'grid'],
        ].forEach(([selector, visibleInMode]) => {
            this.$(selector).classList.toggle('hidden', this.activeMode != visibleInMode);
        });
    }

    setMode(m) {
        this[this.activeMode + '2' + m]?.();
        this.activeMode = m;
        this.render();
    }

    grid2gradient() {
        let gridHeight = this.gridController.colorGrid.height;
        let firstColumnColors = Array(gridHeight).fill(0).map(
            (_, y) => this.gridController.colorGrid.extrapolatedAt(0, y)
        );
        this.gradController.setToColors(firstColumnColors.reverse());
    }

    gradient2grid() {
        const gradColors = this.gradController.getColors().reverse();
        const gridHeight = Math.max(2, gradColors.length)
        while(gradColors.length < gridHeight) {
            gradColors.push(null);
        }

        this.gridController.resetTo(
            2,
            gridHeight,
            [gradColors, Array(gridHeight).fill(null)],
        );

        let [,, newTargetColor] = this.gridController.colorGrid.getDefinedColors()[0];
        this.colorPointer.pointTo(newTargetColor);
    }

    setPreview(m) {
        this.gradController.previewMode = m;
        this.gradController.render();
        this.render();
    }

    copyAs(e, ...formatArgs) {
        const buttonEl = e.currentTarget;
        const text = this.getCopyText(...formatArgs);
        navigator.permissions.query({name: 'clipboard-write'}).then(
            _ => navigator.clipboard.writeText(text).then(
                _ => toastSuccess(buttonEl)
            )
        );
    }

    getCopyText(format, quote, separator, gridFormat) {
        if(this.activeMode == 'gradient') {
            return this.gradController.getColors()
                .map(c => format + hex(c.r(), c.g(), c.b(), c.a()).slice(1))
                .map(c => quote + c + quote)
                .join(separator);

        }else if(this.activeMode == 'grid') {
            let colorStrings = map2d(
                this.gridController.colorGrid.getDenseColorArray(),
                (x, y, c) => quote + format + hex(c.r(), c.g(), c.b(), c.a()).slice(1) + quote,
            );

            if(gridFormat == 'visualGrid') {
                let maxLenByCol = colorStrings.map(
                    col => Math.max(...col.map(color => color.length))
                );
                colorStrings = map2d(
                    colorStrings,
                    (x, y, color) => {
                        return color + " ".repeat(maxLenByCol[x] - color.length);
                    }
                );
                colorStrings = colorStrings.map(col => col.reverse());

                return transpose(colorStrings)
                    .map(row => row.join(', ').trim())
                    .join('\n')
                    .replace(/( +),/g, ",$1");
            }else{
                return '[' + colorStrings.map(col => '[' + col.join(', ') + ']').join(', ') + ']';
            }

        }else{
            throw "Unknown active mode."
        }
    }
}

