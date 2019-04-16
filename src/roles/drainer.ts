export class Drainer
{

    static run(creep: Creep, targetRoom: string)
    {
        if(creep.room.name !== targetRoom) {
            creep.moveToRoom(targetRoom, false, true);
        }
        else {
            const room = Game.rooms[targetRoom];
            if(!room) return;

            if(!creep.memory.targetX || !creep.memory.targetY) Drainer.defineSafeSpace(creep);
            else {
                if(creep.pos.x !== creep.memory.targetX || creep.pos.y !== creep.memory.targetY) creep.moveTo(creep.memory.targetX, creep.memory.targetY);
                if(creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
                    const hostilesInRange = creep.pos.findInRange(creep.room.hostiles, 3);
                    if(hostilesInRange && hostilesInRange.length > 1) creep.rangedMassAttack();
                    else {
                        const target = creep.pos.findClosestByRange(creep.room.hostiles);
                        if(target) creep.rangedAttack(target);
                    }
                }
            }
        }

        creep.heal(creep); // Always heal!
    }

    private static defineSafeSpace(creep: Creep)
    {
        if(Game.flags[creep.room.name+'_d']) {
            creep.memory.targetX = Game.flags[creep.room.name+'_d'].pos.x;
            creep.memory.targetY = Game.flags[creep.room.name+'_d'].pos.y;
        }
        else {
            // Automated fun

            // Place flag for the next creeps!
        }
    }
}
