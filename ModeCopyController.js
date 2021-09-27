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

        this.$('.copy0x').addEventListener('click', e =>           this.copyAs(e, '0x', '', ', '));
        this.$('.copyPound').addEventListener('click', e =>        this.copyAs(e, '#',  '', ', '));
        this.$('.copyPoundQ').addEventListener('click', e =>       this.copyAs(e, '#', '"', ', '));
        this.$('.copyPoundNewline').addEventListener('click', e => this.copyAs(e, '#',  '', '\n'));
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

        this.gridController.colorGrid.resetTo(
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

    copyAs(e, format, quote, separator) {
        const buttonEl = e.currentTarget;
        let colors = this.gradController.getColors()
            .map(c => format + hex(c.r(), c.g(), c.b(), c.a()).slice(1))
            .map(c => quote + c + quote)
            .join(separator);
        navigator.permissions.query({name: 'clipboard-write'}).then(
            _ => navigator.clipboard.writeText(colors).then(
                _ => toastSuccess(buttonEl)
            )
        );
    }
}
