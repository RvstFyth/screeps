import {MapHelper} from "./map";

export class ResourcesHelper
{
    public static inTerminal(room: Room, r: ResourceConstant) : number
    {
        return (room.terminal ? room.terminal.store[r] || 0 : 0);
    }

    public static inStorage(room: Room, r: ResourceConstant) : number
    {
        return (room.storage ? room.storage.store[r] || 0 : 0);
    }

    public static inRoom(room: Room, r: ResourceConstant) : number
    {
        return ResourcesHelper.inStorage(room, r) + ResourcesHelper.inTerminal(room, r);
    }

    public static totalInTerminals(r: ResourceConstant) : number
    {
        let total = 0;
        const rooms = MapHelper.ownedRooms();
        for(let i in rooms) {
            const room = rooms[i];
            if(room.terminal) total += room.terminal.store[r] || 0;
        }
        return total;
    }

    public static totalInStorages(r: ResourceConstant) :number
    {
        let total = 0;
        const rooms = MapHelper.ownedRooms();
        for(let i in rooms) {
            const room = rooms[i];
            if(room.storage) total += room.storage.store[r] || 0
        }

        return total;
    }
}
