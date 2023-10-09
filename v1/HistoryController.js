class HistoryItem{
    constructor(parent, grad, saved = false) {
        this.parent = parent;
        this.saved = saved;
        this.el = document.createElement('div');
        this.el.className = 'historyGrad';
        this.el.addEventListener(
            'click',
            e => parent.moveToFront(this),
        );
        this.updateTo(grad);
    }

    updateTo(grad) {
        this.grad = grad;
        this.render();
    }

    render() {
        if(this.isGrid()) {
            let colors = this.populateGridNullValues(this.grad);
            this.el.innerHTML =
                map2d(
                    colors,
                    c => `<div class='colorHistoryBlock' style='background:${c}'></div>`,
                )
                .reduce((all, arr) => [...all, ...arr], [])
                .join('');
            this.el.style.backgroundImage = '';
            this.el.style.gridTemplateColumns = "1fr ".repeat(colors[0].length);
        }else{
            this.el.innerHTML = '';
            this.el.style.backgroundImage = colorsToBgImage(
                this.grad,
                false,
                'to right',
            );
        }
    }

    isGrid() {
        return this.grad[0] instanceof Array;
    }

    populateGridNullValues(gridColors) {
        let grid = new ColorGrid();
        grid.resetTo(map2d(gridColors,
            c => c == null ? null : (parseColor(c) || null)
        ));
        return grid.getDenseColorArray();
    }

    clone() {
        if(this.isGrid()) {
            return new HistoryItem(this.parent, map2d(this.grad, _ => _));
        }else{
            return new HistoryItem(this.parent, this.grad.slice());
        }
    }
}

class HistoryController extends View{
    constructor(gradientController, gridController) {
        super();

        this.gradientController = gradientController;
        this.gridController = gridController;

        gradientController.onChange(_ => this.updateGradient());
        gridController.colorGrid.onChange(_ => this.updateGrid());

        this.history = this.load();

        // we load the initial history from the gradient controller state,
        // since this state is the default.
        this.history.unshift(new HistoryItem(
            this,
            gradientController.getColors().map(c => c.toString()),
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
        this.history.forEach(h => this.el.appendChild(h.el));
    }

    updateGradient() {
        // updates the first item in the list to reflect the current
        // gradient
        if(moveCopyController.activeMode != 'gradient') return;
        this.history[0].updateTo(
            this.gradientController.getColors().map(c => c.toString())
        );
        this.save();
    }

    updateGrid() {
        // updates the first item in the list to reflect the current
        // grid
        if(moveCopyController.activeMode != 'grid') return;
        this.history[0].updateTo(
            map2d(this.gridController.colorGrid.colors, c => c?.toString() || null)
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
            this.history[0].render();

            if(this.history[0].isGrid()) {
                moveCopyController.setModeSilent('grid');
                let newColors = map2d(
                    this.history[0].grad,
                    c => c == null ? null : (parseColor(c) || null),
                );
                this.gridController.resetTo(newColors);
            }else{
                moveCopyController.setModeSilent('gradient');
                let newColors = this.history[0].grad.map(c => parseColor(c));
                this.gradientController.setToColors(newColors);
            }

            this.render();
        }
    }

    async pasteList() {
        // TODO: auto detect grids

        let v = await navigator.clipboard.readText();
        console.log(v);
        let colorList = parseList(v);
        if(colorList.length < 1) return;

        this.addNew();

        moveCopyController.setModeSilent('gradient');
        this.gradientController.setToColors(colorList);
    }
}
