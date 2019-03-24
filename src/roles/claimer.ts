export class Claimer
{

    static run(creep: Creep, targetRoom: string)
    {
        if(creep.room.name !== targetRoom) {
            creep.moveToRoom(targetRoom, true, true);
        }
        else {
            if(creep.room.controller) {
                if(creep.pos.isNearTo(creep.room.controller)) {
                    creep.say('#overlords');
                    creep.claimController(creep.room.controller);
                }
                else {
                    creep.moveTo(creep.room.controller, {maxRooms: 1});
                }
            }
        }
    }
}
