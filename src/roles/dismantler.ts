export class Dismantler
{

    static run(creep: Creep, targetRoom: string, targetID: string)
    {
        if(creep.room.name !== targetRoom) {
            creep.moveToRoom(targetRoom);
        }
        else {
            const target: StructureWall|StructureRampart|null = Game.getObjectById(targetID);
            if(target) {
                if(!creep.pos.isNearTo(target)) {
                    creep.moveTo(target);
                }
                else {
                    creep.dismantle(target);
                }
            }
        }
    }
}
