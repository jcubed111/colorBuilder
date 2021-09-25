class ModeCopyController extends View{
    el() {
        return document.getElementById('gradientViewController');
    }

    constructor(gradController) {
        super();
        this.gradController = gradController;
        this.render();

        this.$('.mode_gradient').addEventListener('click', e => this.setMode('gradient'));
        this.$('.mode_swatches').addEventListener('click', e => this.setMode('swatches'));
        this.$('.mode_random').addEventListener('click', e =>   this.setMode('random'));
        this.$('.mode_bars').addEventListener('click', e =>     this.setMode('bars'));
        this.$('.copy0x').addEventListener('click', e =>           this.copyAs(e, '0x', '', ', '));
        this.$('.copyPound').addEventListener('click', e =>        this.copyAs(e, '#',  '', ', '));
        this.$('.copyPoundQ').addEventListener('click', e =>       this.copyAs(e, '#', '"', ', '));
        this.$('.copyPoundNewline').addEventListener('click', e => this.copyAs(e, '#',  '', '\n'));
        // this.$('.paste').addEventListener('click', e => this.paste());
    }

    render() {
        ['gradient', 'swatches', 'random', 'bars'].forEach(m => {
            this.$('.mode_' + m).classList.toggle('active', this.gradController.mode == m);
        });
    }

    setMode(m) {
        this.gradController.mode = m;
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
