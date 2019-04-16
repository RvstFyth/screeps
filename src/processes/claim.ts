import { Process } from "ROS/process";
import { MapHelper } from "helpers/map";

// META
// target
export class Claim extends Process
{

    public run()
    {
        let rooms: Room[] = [];
        const ownedRooms: Room[] = MapHelper.ownedRooms();
        for(let r in ownedRooms) {

        }
    }
}
