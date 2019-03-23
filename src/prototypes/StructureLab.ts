Object.defineProperty(StructureLab.prototype, 'memory', {
    configurable: true,
    get: function () {
        if (_.isUndefined(Memory.customLabsMem)) {
            Memory.customLabsMem = {};
        }
        if (!_.isObject(Memory.customLabsMem)) {
            return undefined;
        }
        return Memory.customLabsMem[this.id] =
            Memory.customLabsMem[this.id] || {};
    },
    set: function (value) {
        if (_.isUndefined(Memory.customLabsMem)) {
            Memory.customLabsMem = {};
        }
        if (!_.isObject(Memory.customLabsMem)) {
            throw new Error('Could not set lab memory');
        }
        Memory.customLabsMem[this.id] = value;
    }
});


Object.defineProperty(StructureLab.prototype, 'boosted', {
    configurable: true,
    get: function() {
        if(this.memory.boosted === undefined || (this.memory.boostedTS && this.memory.boostedTS + 1000 < Game.time - 1)) {
            this.memory.boosted = false;
            this.memory.boostedTS = 0;
        }

        return this.memory.boosted;
    },
    set: function(value) {
        if(value === true) {
            this.memory.boosted = true;
            this.memory.boostedTS = Game.time;
        }
        else if(value === false) {
            this.memory.boosted = false;
            this.memory.boostedTS = 0;
        }
    }
});
