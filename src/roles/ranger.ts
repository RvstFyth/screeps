export class Ranger
{

    public static roleName = 'ranger';

    static run(creep: Creep, targetRoom: string)
    {
        if(creep.room.name !== targetRoom) {
            creep.moveToRoom(targetRoom);
        }
        else {
            const filledTowers = creep.room.towers.filter((t: StructureTower) => t.energy > 10);
            // const rangers = creep.room.find(FIND_MY_CREEPS, {
            //     filter: (c: Creep) => c.memory.role === this.roleName && !c.pos.isExitTile()
            // });

            if(filledTowers.length) {

            }
        }
    }

    public static defineBodyParts(room: Room)
    {

    }
}
