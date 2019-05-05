export class DefenderRanger
{

    static run(creep: Creep, room: Room, targetRoom: string)
    {
        if(creep.room.name !== targetRoom) {
            creep.moveToRoom(targetRoom);
            creep.heal(creep);
        }
        else {
            const hostiles = creep.room.hostiles;
            if(hostiles && hostiles.length) {
                const healers = hostiles.filter((c: Creep) => c.getActiveBodyparts(HEAL));
                const inRange = creep.pos.findInRange(hostiles, 3);
                const adjacent = inRange.filter((c: Creep) => creep.pos.inRangeTo(c, 1));
                const inRangeAttack = adjacent.filter((c: Creep) => c.getActiveBodyparts(ATTACK));

                if(inRange.length > 1) {
                    if(adjacent.length > 1 && Game.time % 3 === 0) {
                        creep.rangedMassAttack();
                    }
                    if(healers.length && creep.pos.inRangeTo(healers[0], 3)) {
                        creep.rangedAttack(healers[0]);
                    }
                    else {
                        creep.rangedAttack(inRange[0]);
                    }
                }
                else if(inRange.length === 1) {
                    creep.rangedAttack(inRange[0]);
                }

                if(inRangeAttack.length) {
                    creep.flee(inRangeAttack, 2);
                }
                else {

                    if(healers.length) {
                        creep.moveTo(healers[0], {maxRooms:1, range: 3});
                    }
                    else {
                        creep.moveTo(hostiles[0], {maxRooms:1, range: 3});
                    }
                }

                creep.heal(creep);
            }
            else {
                const damagedCreeps = creep.room.find(FIND_MY_CREEPS).filter((c: Creep) => c.hits < c.hitsMax);
                if(damagedCreeps && damagedCreeps.length) {
                    const target = creep.pos.findClosestByRange(damagedCreeps);
                    if(target && creep.heal(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {maxRooms: 1});
                        creep.heal(creep);
                    }
                }
                else {
                    if(creep.room.controller && !creep.pos.isNearTo(creep.room.controller)) {
                        creep.moveTo(creep.room.controller);
                    }
                    creep.heal(creep);
                }
            }
        }
    }
}
