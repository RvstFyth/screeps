Object.defineProperty(StructureController.prototype, 'memory', {
    configurable: true,
    get: function() {
        if(_.isUndefined(Memory.mySourcesMemory)) {
            Memory.mySourcesMemory = {};
        }
        if(!_.isObject(Memory.mySourcesMemory)) {
            return undefined;
        }
        return Memory.mySourcesMemory[this.id] =
                Memory.mySourcesMemory[this.id] || {};
    },
    set: function(value) {
        if(_.isUndefined(Memory.mySourcesMemory)) {
            Memory.mySourcesMemory = {};
        }
        if(!_.isObject(Memory.mySourcesMemory)) {
            throw new Error('Could not set source memory');
        }
        Memory.mySourcesMemory[this.id] = value;
    }
});

Object.defineProperty(StructureController.prototype, 'global', {
    get: function()
    {
        return global.cache[this.id] = global.cache[this.id] || {};
    },
    set: function(value)
    {
        global.cache[this.id] = value;
    },
    configurable: true
})

Object.defineProperty(StructureController.prototype, 'spots', {
    get: function ()
    {
        if(!this._spots) {
            const terrainData = Game.map.getRoomTerrain(this.room.name);
            this._spots = [];
            for(let x = this.pos.x -3, xEnd = this.pos.x+4;x < xEnd; x++) {
                for(let y = this.pos.y-3, yEnd = this.pos.y+4; y < yEnd; y++) {
                    const tile = terrainData.get(x, y)
                    if (tile !== TERRAIN_MASK_WALL && !this.room.lookForAt(LOOK_CREEPS, x, y).length) {
                        this._spots.push(new RoomPosition(x, y, this.room.name));
                    }
                }
            }
            if(this._spots.length) {
                this._spots.sort((a: RoomPosition,b: RoomPosition) => this.pos.getRangeTo(a) - this.pos.getRangeTo(b));
            }
        }

        return this._spots;
    },
    enumerable: false,
    configurable: true
});
