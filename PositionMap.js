class PositionMap{
    // a Map[(v, *), v]
    // for things like mapping coordinates to items

    constructor() {
        this.size = 0;

        this.items = new Map();
    }

    clear() {
        this.items.clear();
        this.size = 0;
    }

    _findLastMap(key, then, otherwise = () => undefined) {
        // finds the Map that contains the last part of Key, if it exists
        // key: List
        // then: (lastMap, lastKeyPart) => returnValue
        // otherwise: () => returnValue
        let map = this.items;
        for(let i = 0; i < key.length - 1; i++) {
            if(map.has(key[i])) {
                map = map.get(key[i]);
            }else{
                return otherwise();
            }
        }
        return then(map, key[key.length - 1]);
    }

    delete(key) {
        // Returns true if an element in the Map object existed and has been removed, or false if the element does not exist. has(key) will return false afterwards.
        return this._findLastMap(
            key,
            (lastMap, lastKey) => {
                const removed = lastMap.remove(lastKey);
                if(removed) this.size--;
                return removed;
            },
            () => false,
        );
    }

    get(key) {
        // Returns the value associated to the key, or undefined if there is none.
        return this._findLastMap(
            key,
            (lastMap, lastKey) => {
                return lastMap.get(lastKey);
            },
            () => undefined,
        );
    }

    has(key) {
        // Returns a boolean asserting whether a value has been associated to the key in the Map object or not.
        return this._findLastMap(
            key,
            (lastMap, lastKey) => {
                return lastMap.has(lastKey);
            },
            () => false,
        );
    }

    set(key, value) {
        // Sets the value for the key in the Map object. Returns the Map object.
        let map = this.items;
        for(let i = 0; i < key.length - 1; i++) {
            if(map.has(key[i])) {
                map = map.get(key[i]);
            }else{
                map.set(key[i], new Map());
                map = map.get(key[i]);
            }
        }
        if(!map.has(key[key.length - 1])) this.size++;
        map.set(key[key.length - 1], value);
        return this;
    }

    *[Symbol.iterator]() {
        // Returns a new Iterator object that contains an array of [key, value] for each element in the Map object.
        function* yieldRecursive(map, key = []) {
            for(let [k, v] of map) {
                if(v instanceof Map) {
                    yield* yieldRecursive(v, [...key, k]);
                }else{
                    yield [[...key, k], v];
                }
            }
        }

        yield* yieldRecursive(this.items);
    }

    *keys() {
        // Returns a new Iterator object that contains the keys for each element in the Map object.
        for(let [k, v] of this) {
            yield k;
        }
    }

    *values() {
        // Returns a new Iterator object that contains the values for each element in the Map object.
        for(let [k, v] of this) {
            yield v;
        }
    }

    *entries() {
        // Returns a new Iterator object that contains an array of [key, value] for each element in the Map object.
        yield* this;
    }

    forEach(callbackFn) {
        // Calls callbackFn once for each key-value pair present in the Map object. If a thisArg parameter is provided to forEach, it will be used as the this value for each callback.
        for(let pair of this) {
            callbackFn(...pair, this);
        }
    }
}
