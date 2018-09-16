Creep.prototype.moveToRoom = function(roomName: string)
{
    this.moveTo(new RoomPosition(25,25,roomName), {
        reusePath: 9,
        range: 15
    });
}

if(!Creep.prototype._suicide) {
    Creep.prototype._suicide = Creep.prototype.suicide;
    Creep.prototype.suicide = function()
    {
        if(this.room.recycleContainers.length) {
            if(this.pos.isEqualTo(this.room.recycleContainers[0])) {
                const spawns = this.pos.findInRange(this.room.spawns, 1)
                if(spawns.length) {
                    spawns[0].recycleCreep(this);
                }
            }
            else {
                if(this.pos.isNearTo(this.room.recycleContainers[0])) {
                    const creeps = this.room.recycleContainers[0].pos.lookFor(LOOK_CREEPS);
                    if(creeps.length) {
                        creeps[0].moveTo(this.pos.x, this.pos.y);
                    }
                }
                this.moveTo(this.room.recycleContainers[0]);
            }
        }
        else {
            return this._suicide();
        }
    }
}
