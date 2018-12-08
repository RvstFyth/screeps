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
