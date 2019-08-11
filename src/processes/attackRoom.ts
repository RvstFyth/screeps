import {Process} from '../ROS/process'
import { MapHelper } from 'helpers/map';

export class AttackRoom extends Process
{

    private collectIntel(room: Room)
    {
        const exitsData: any = {}
        const exits = Game.map.describeExits(room.name);
        let pathTo: Structure;
        if(room.storage) pathTo = room.storage;
        else if(room.spawns.length) {

        }
        for(let e in exits) {
            let tmp = {
                rampartsToTarget: 0
            }

            exitsData[e] = tmp;
        }


        // const terrainData = Game.map.getRoomTerrain(room.name);

        const numTowers = room.towers.length;
        // Define exit tiles that gets the least damage from the towers!

        this.meta.intel = {

        }
    }

    private requestObserver(targetName: string)
    {
        const ownedRooms: Room[] = MapHelper.ownedRooms().filter((r: Room) => Game.map.getRoomLinearDistance(r.name, targetName) <= 10 && r.observer);
        const inRange = ownedRooms.filter((r: Room) => Game.map.getRoomLinearDistance(r.name, targetName) <= 10 && r.observer);
        if(inRange && inRange.length) {
            inRange[0].observer!.observeRoom(targetName);
        }
    }

    public run()
    {
        const room = Game.rooms[this.meta.room];
        const target = Game.rooms[this.meta.target];

        if(room && room.controller && room.controller.my) {
            if(!this.meta.intel) {
                if(target) {
                    this.collectIntel(target);
                }
                else {
                    this.requestObserver(this.meta.target);
                }
            }
            else {
                // Spawn the right processes
            }
        }
    }

}
