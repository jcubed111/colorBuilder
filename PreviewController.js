class PreviewController extends View{
    el() {
        return document.getElementById('previewCanvas');
    }

    constructor(modeCopyController) {
        super();

        this.modeCopyController = modeCopyController;
        this.previewMode = 'smooth';
    }

    setMode(m, colorSet) {
        this.previewMode = m;
        this.render(colorSet);
    }

    render(colorSet) {
        this.el.style.display = 'block';
        this.el.width = window.innerWidth;
        this.el.height = window.innerHeight;

        this['render_' + this.previewMode](colorSet);
    }

    clearCanvas() {
        this.el.getContext('2d').clearRect(0, 0, innerWidth, innerHeight);
    }

    render_smooth(colorSet) {
        // TODO: better results for grid mode
        this.clearCanvas();
        this.el.style.backgroundImage = colorsToBgImage(
            colorSet.map(v => v.toString())
        );
    }

    render_bars(colorSet) {
        // TODO: better results for grid mode
        this.clearCanvas();
        this.el.style.backgroundImage = colorsToBgImage(
            colorSet.map(v => v.toString()),
            false,
        );
    }

    render_swatches(colorSet) {
        let ctx = this.el.getContext('2d');
        let colors = colorSet.asList();
        const size = 53;
        for(let x=0; x < window.innerWidth; x += size) {
            for(let y=0; y < window.innerHeight; y += size) {
                let i = Math.floor(Math.random() * colors.length);
                ctx.fillStyle = colors[i];
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    render_random(colorSet) {
        let ctx = this.el.getContext('2d');
        const size = 53;
        for(let x=0; x < window.innerWidth; x += size) {
            for(let y=0; y < window.innerHeight; y += size) {
                ctx.fillStyle = colorSet.at(Math.random(), Math.random());
                ctx.fillRect(x, y, size, size);
            }
        }
    }
}
