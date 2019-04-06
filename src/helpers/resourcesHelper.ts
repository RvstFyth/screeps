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
        return Resources.inStorage(room, r) + Resources.inTerminal(room, r);
    }

    public static totalInTerminals(r: ResourceConstant) : number
    {
        return 0;
    }

    public static totalInStorages(r: ResourceConstant) :number
    {
        return 0;
    }
}
