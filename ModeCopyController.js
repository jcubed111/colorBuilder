class ModeCopyController extends View{
    el() {
        return document.getElementById('modeCopyController');
    }

    constructor(gradController, gridController) {
        super();
        this.gradController = gradController;
        this.gridController = gridController;
        this.activeMode = 'gradient';
        this.render();

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
        ['gradient', 'swatches', 'random', 'bars'].forEach(m => {
            this.$('.preview_' + m).classList.toggle('active', this.gradController.previewMode == m);
        });
        this.gradController.el.classList.toggle('hidden', this.activeMode != 'gradient');
        this.gridController.el.classList.toggle('hidden', this.activeMode != 'grid');
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
