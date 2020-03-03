class View{
    constructor() {
        this.el = this.el();
        this.el.classList.add('view-' + this.constructor.name);
    }

    $(s) {
        return this.el.querySelector(s);
    }
}
