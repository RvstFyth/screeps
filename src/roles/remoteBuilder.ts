export class remoteBuilder
{


    static run(creep: Creep, room: string, targetRoom: string)
    {
        if(creep.room.name !== targetRoom) {
            if(creep.room.name === room && _.sum(creep.carry) === 0 && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 40000) {
                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }
            else {
                creep.moveToRoom(targetRoom, true, true);
            }
        }
        else {

        }
    }
}
