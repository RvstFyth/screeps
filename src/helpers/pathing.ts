/**
 *
 * Paths are stored in memory as string 'xy|xy|xy'
 * Paths are parsed and stored as object in global '{x:x,y:y}'
 *
 * in getPath() we first check the global if the path is available.
 * When the path is not in global, we fetch the path string from memory, and parse it.
 * If there is no path string in memory, we use path finder to find a path.
 *
 */

export class PathingHelper
{
    static initialize()
    {
        if(!global.paths) {
            global.paths = {};
        }

        if(!Memory.paths) {
            Memory.paths = {};
        }
    }

    static existsInCache(key: string) : boolean
    {
        return global.paths[key] || Memory.paths[key];
    }

    static getPath(key: string) : object[]|undefined
    {
        if(!global.paths[key] && Memory.paths[key]) {
            global.paths[key] = this.stringToPath(Memory.paths[key]);
        }

        return global.paths[key];
    }

    static saveInCache(key: string, path: PathStep[])
    {
        Memory.paths[key] = this.pathToString(path);
        global.paths[key] = this.stringToPath(Memory.paths[key]);
    }

    static stringToPath(path: string) : {x:number, y:number, d:number}[]
    {
        let splitted: string[] = path.split('|');
        let output: any = {};

        for(let i in splitted) {

            const x = splitted[i].substring(0,2),
                  y = splitted[i].substring(2,4);

            output[x+y] = {
            x: parseInt(x),
            y: parseInt(y),
            d: parseInt(splitted[i].substring(4))
            }
        }

        return output;
    }

    static pathToString(path: PathStep[]) : string
    {
        let output: string = '';
        for(let i in path) {
            const x: string = path[i].x < 10 ? '0'+path[i].x : path[i].x.toString();
            const y: string = path[i].y < 10 ? '0'+path[i].y : path[i].y.toString();
            if(output !== '') {
                output += '|';
            }
            output += x+y+path[i].direction;
        }

        return output;
    }
}
