export class MapHelper
{

    /**
     * Parse the room name, and define if it is a neutral room.
     * We use the second and third element of the parsing result.
     * The first element is the complete roomName
     * @param string roomName
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
     * Parse the room name and define if it is a source keeper room.
     * We use the second and third element of the parsing result.
     * The first element is the complete roomName
     * @param string roomName
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
}

