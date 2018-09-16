export class MineralHauler
{
    static run(creep: Creep)
    {
        if(_.sum(creep.carry) === 0) {
            creep.memory.harvesting = true;
        }
        else if(_.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.harvesting = false;
        }

        if(creep.memory.harvesting) {
            if(!creep.memory.target) {

            }
            if(creep.memory.target) {
                const target: StructureContainer|null = Game.getObjectById(creep.memory.target);
                if(target) {
                    if(!creep.pos.isNearTo(target)) {
                        creep.moveTo(target);
                    }
                    else {
                        if(_.sum(target.store) > 0) {
                            creep.withdraw(target, _.findKey(target.store) as ResourceConstant);
                        }
                        else {
                            creep.memory.target = '';
                            creep.memory.harvesting = false;
                        }
                    }
                }
                else {
                    // WTF???
                }
            }
        }
        else { // Deliver resources
            if(creep.room.storage && _.sum(creep.room.storage.store) < creep.room.storage.storeCapacity) {
                if(!creep.pos.isNearTo(creep.room.storage)) {
                    creep.moveTo(creep.room.storage);
                }
                else {
                    creep.transfer(creep.room.storage, _.findKey(creep.carry) as ResourceConstant);
                }
            }
            else if(creep.room.terminal && _.sum(creep.room.terminal.store) < creep.room.terminal.storeCapacity) {
                if(!creep.pos.isNearTo(creep.room.terminal)) {
                    creep.moveTo(creep.room.terminal);
                }
                else {
                    creep.transfer(creep.room.terminal, _.findKey(creep.carry) as ResourceConstant);
                }
            }
        }
    }
}
