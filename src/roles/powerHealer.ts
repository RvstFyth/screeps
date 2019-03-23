export class PowerHealer
{


    static run(creep: Creep, attacker: Creep, targetRoom: string)
    {
        if(attacker && !attacker.spawning) {

            if(creep.pos.x === 0) {
                creep.moveTo(1, attacker.pos.y + 1);
            }
            else if(creep.pos.x === 49) {
                creep.moveTo(48, attacker.pos.y - 1);
            }
            else if(creep.pos.y === 0) {
                creep.moveTo(attacker.pos.x + 1, 1);
            }
            else if(creep.pos.y === 49) {
                creep.moveTo(attacker.pos.x, 48);
            }
            else {
                creep.moveTo(attacker);
            }

            if(creep.room.name === targetRoom) {
                if(creep.hits < creep.hitsMax) {
                    creep.heal(creep);
                }
                else {
                    creep.heal(attacker);
                }
            }
            else {
                if(attacker.hits < attacker.hitsMax) {
                    creep.heal(attacker);
                }
                else {
                    creep.heal(creep);
                }
            }
        }
    }

    static defineBodyParts()
    {
        return [
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
            HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,
            HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL]
    }
}
