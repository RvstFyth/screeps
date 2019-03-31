import {MapHelper} from '../helpers/map';

Creep.prototype.moveToRoom = function(roomName: string, ignoreSK?: boolean, prioritizeHighways? : boolean)
{
    const res: any = MapHelper.findRoute(this.room.name, roomName, {
        ignoreSK: ignoreSK,
        prioritizeHighways: prioritizeHighways
    });

    let room;
    if(res && res.length) {
        room = res[0].room;
    }
    else {
        room = roomName;
    }
    this.moveTo(new RoomPosition(25,25,room), {
        reusePath: 9,
        range: 15,
        maxRooms: 1
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

Creep.prototype.flee = function(targets: any, range = 7) : any
{
    if (!_.isArray(targets))
        targets = [targets];

    var goals = _.map(targets, function(target: any) {return {pos: target.pos, range: range}});
    var opts = {flee: true, maxOps: 2000};

    var path = PathFinder.search(this.pos, goals, opts);

    if (path && !path.incomplete) {
        this.move(this.pos.getDirectionTo(path.path[0]));
        return OK;
    }

    return ERR_NO_PATH;
};
