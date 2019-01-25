export class RemoteDefender
{

    static run(creep: Creep, targetRoom: string)
    {
        if(creep.room.name !== targetRoom) {
            creep.moveToRoom(targetRoom);
        }
        else {
            if(creep.room.invaders.length) {
                const closest = creep.pos.findClosestByRange(creep.room.invaders);
                if(closest) {
                    if(!creep.pos.inRangeTo(closest, 3)) {
                        creep.moveTo(closest);
                    }
                    else {
                        const hostilesInRange = creep.pos.findInRange(creep.room.invaders, 3);
                        if(hostilesInRange.length && hostilesInRange.length > 1) {
                            creep.rangedMassAttack();
                        }
                        else {
                            creep.rangedAttack(closest);
                        }
                    }
                    if(creep.pos.inRangeTo(closest, 1)) {
                        creep.attack(closest);
                    }
                    if(creep.hits < creep.hitsMax) {
                        creep.heal(creep);
                    }
                }
            }
            else {
                if(creep.room.controller) {
                    if(!creep.pos.inRangeTo(creep.room.controller, 3)) {
                        creep.moveTo(creep.room.controller);
                    }
                }
            }
        }
    }
}
