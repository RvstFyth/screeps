export class PowerAttacker
{


    static run(creep: Creep, healer: Creep, targetRoom: string)
    {
        if(healer && !healer.spawning) {

            if(creep.room.name !== targetRoom) {
                if(creep.pos.isNearTo(healer)) {
                    if (creep.fatigue === 0 && healer.fatigue === 0 || (creep.pos.x === 0 || creep.pos.x === 49 || creep.pos.y === 0 || creep.pos.y === 49)) {
                        creep.moveToRoom(targetRoom, true, true);
                    }
                }
            }
            else {
                const room = Game.rooms[targetRoom];
                if(room) {
                    const powerbank = room.find(FIND_STRUCTURES, {filter: (s: Structure) => s.structureType === STRUCTURE_POWER_BANK})[0];
                    if(powerbank) {
                        if(creep.pos.isNearTo(healer)) {
                            if (creep.fatigue === 0 && healer.fatigue === 0) {
                                creep.moveTo(powerbank, {maxRooms: 1});
                            }
                        }
                        if(creep.pos.isNearTo(powerbank) && creep.hits === creep.hitsMax) {
                            creep.attack(powerbank);
                        }
                    }
                }
            }
        }
    }

    static defineBodyParts()
    {
        return [
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
            ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK
        ]
    }
}
