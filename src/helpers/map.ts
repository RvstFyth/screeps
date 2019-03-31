interface FindRouteOptions {
    ignoreSK: boolean|undefined,
    prioritizeHighways: boolean|undefined

}

export class MapHelper
{

    /**
     * Parse the room name, and define if it is a neutral room.
     * We use the second and third element of the parsing result.
     * The first element is the complete roomName
     * @param roomName
     */
    public static isNeutralRoom(roomName: string) : boolean
    {
        const p: any = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        if(p && p[1] && p[2]) {
            return p[1] % 10 === 0 && p[2] % 10 === 0;
        }
        return false;
    }

    /**
     * Define if the room is a owned room.
     * @param roomName
     */
    public static isOwnRoom(roomName: string)
    {
        if(!Game.rooms[roomName]) return false;
        const room = Game.rooms[roomName];
        return room.controller && room.controller.my;
    }

    /**
     * Parse the room name and define if it is a source keeper room.
     * We use the second and third element of the parsing result.
     * The first element is the complete roomName
     * @param roomName
     */
    public static isSourceKeeperRoom(roomName: string) : boolean
    {
        const p: RegExpExecArray|null = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        if(p) {
            if(p[1] && p[2]) {
                const p1 = parseInt(p[1]) % 10;
                const p2 = parseInt(p[2]) % 10;
                return !(p1 === 5 && p2 === 5) && (p1 >= 4 && p1 <= 6) && (p2 >= 4 && p2 <= 6);
            }
        }
        return false;
    }

    public static findRoute(from: string, to: string, opts?: FindRouteOptions)
    {
        return Game.map.findRoute(from, to, {
            routeCallback: function(roomName) {
                if(!Game.map.isRoomAvailable(roomName)) return Infinity;
                if(opts && opts.ignoreSK && MapHelper.isSourceKeeperRoom(roomName)) return Infinity;
                if(Memory.roomBlacklist && Memory.roomBlacklist.indexOf(roomName) > -1) return Infinity;
                if(opts && opts.prioritizeHighways) return MapHelper.isNeutralRoom(roomName) ? 1 : 2.5;
                return 1;
            }
        });
    }
}

