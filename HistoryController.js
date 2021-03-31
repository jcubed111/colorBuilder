class HistoryItem{
    constructor(parent, grad, saved = false) {
        this.parent = parent;
        this.saved = saved;
        this.element = document.createElement('div');
        this.element.className = 'historyGrad';
        this.element.addEventListener(
            'click',
            e => parent.moveToFront(this),
        );
        this.updateTo(grad);
    }

    updateTo(grad) {
        this.grad = grad;
        this.element.style.backgroundImage = colorsToBgImage(
            this.grad,
            false,
            'to right',
        );
    }

    clone() {
        return new HistoryItem(this.parent, this.grad.slice());
    }
}

class HistoryController extends View{
    constructor(gradController) {
        super();
        this.gradController = gradController;
        gradController.onChange(_ => this.update());
        this.history = this.load();
        this.history.unshift(new HistoryItem(
            this,
            gradController.getColors().map(c => c.toString()),
        ));
        this.render();

        document.getElementById('gradPasteButton').addEventListener(
            'click',
            e => this.pasteList(),
        );
    }

    el() {
        return document.getElementById('historyGradArea');
    }

    load() {
        try{
            const history = JSON.parse(localStorage.getItem('colorBuilder_history'));
            return history
                // remove duplicates
                .filter((item, i, history) =>
                    history.findIndex(
                        item2 => item2.join(',') == item.join(',')
                    ) == i
                )
                .map(h => new HistoryItem(this, h, true));
        }catch{
            return [];
        }
    }

    save() {
        localStorage.setItem(
            'colorBuilder_history',
            JSON.stringify(this.history.map(h => h.grad)),
        );
        this.history.forEach(h => h.saved = true);
    }

    render() {
        this.el.innerHTML = "";
        this.history.forEach(h => this.el.appendChild(h.element));
    }

    update() {
        // updates the first item in the list to reflect the current
        // gradient
        this.history[0].updateTo(
            this.gradController.getColors().map(c => c.toString())
        );
        this.save();
    }

    addNew() {
        this.history.unshift(this.history[0].clone());
        this.render();
        this.save();
    }

    moveToFront(historyItem) {
        let i = this.history.indexOf(historyItem);
        if(i == 0) {
            this.addNew();
        }else{
            if(!this.history[0].saved) {
                // small quirk: if the previously-first history item hasn't
                // been saved, silently forget it. This prevents us saving
                // our default color if the first action the user takes
                // is to load a history item.
                this.history[0] = this.history.splice(i, 1)[0];
            }else{
                this.history.unshift(...this.history.splice(i, 1));
            }

            this.gradController.setToColors(
                this.history[0].grad.map(
                    c => parseColor(c)
                )
            );

            this.render();
        }
    }

    async pasteList() {
        let v = await navigator.clipboard.readText();
        console.log(v);
        let colorList = parseList(v);
        if(colorList.length < 1) return;

        this.addNew();
        this.gradController.setToColors(colorList);
    }
}
