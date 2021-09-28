class View extends Model{
    constructor() {
        super();
        this.el = this.el();
        this.el.classList.add('view-' + this.constructor.name);
    }

    $(s) {
        return this.el.querySelector(s);
    }

    remove() {
        this.el.remove();
    }

    static fromTemplate(templateId) {
        return document.importNode(document.getElementById(templateId).content, true).children[0];
    }
}
