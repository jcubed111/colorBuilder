class RandBin{
    constructor(numBins) {
        this.numBins = numBins;
        this.binWidth = 1.0 / numBins;
        this.binsAvailable = new Array(numBins);
        this.binsLeft = 0;

        this.resetAvailableBins();
    }

    _randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }

    resetAvailableBins() {
        this.binsLeft = this.numBins;

        for(let i = 0; i < this.numBins; i++) {
            this.binsAvailable[i] = i;
        }

        // shuffle binsAvailable using Fisher-Yates shuffle
        for(let i = this.numBins - 1; i > 0; i--) {
            let j = this._randomInt(0, i + 1);
            // swap
            [this.binsAvailable[i], this.binsAvailable[j]] = [this.binsAvailable[j], this.binsAvailable[i]];
        }
    }

    getBin() {
        let bin = this.binsAvailable[--this.binsLeft];
        if(this.binsLeft == 0) {
            this.resetAvailableBins();
        }
        return bin;
    }

    randDouble(min, max) {
        let s = Math.random();
        let b = this.getBin();
        s = (b + s) * this.binWidth;
        return s * (max-min) + min;
    }

    randInt(minI, maxE) {
        return Math.trunc(this.randDouble(minI, maxE));
    }

    randChance(p = 0.5) {
        return this.randDouble(0, 1) < p;
    }
}
