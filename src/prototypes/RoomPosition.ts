RoomPosition.prototype.isExitTile = function()
{
    return this.x === 0 || this.x === 40 || this.y === 0 || this.y === 49;
}

RoomPosition.prototype.isWalkable = function (ignoreCreeps: boolean = true): boolean {
    let lookTerrain: any = this.lookFor(LOOK_TERRAIN);
    for (var i = 0; i < lookTerrain.length; i++)
        if (OBSTACLE_OBJECT_TYPES[lookTerrain[i]])
            return false;

    let lookStructures: any = this.lookFor(LOOK_STRUCTURES);
    for (var i = 0; i < lookStructures.length; i++)
        if (OBSTACLE_OBJECT_TYPES[lookStructures[i].structureType])
            return false;

    if (!ignoreCreeps) {
        let lookCreeps = this.lookFor(LOOK_CREEPS);
        if (lookCreeps.length)
            return false;
    }
    return true;
}
