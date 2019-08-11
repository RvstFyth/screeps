import {Process} from '../ROS/process'
import {StructuresHelper} from '../helpers/structures'

// OS.kernel.addProcess('room', {name: 'W59S28'}, 0);
export class Room extends Process
{

  run()
  {

  }

  checkStructures(room: any)
  {
    // console.log(`Triggered checkStructures for ${room.name}`)
    if(typeof room.controller !== 'undefined') {
        if(room.controller.level >= 3) {
          StructuresHelper.placeContainerNearSources(room);
        }
        if(room.controller.level >= 6) {
          try {
            StructuresHelper.rampartImportantStructures(room);
            const tiles: RoomPosition[] = StructuresHelper.defineUpgraderSpots(room, 1);
            for(let i in tiles) {
              if(!tiles[i].lookFor(LOOK_STRUCTURES).filter((s: Structure) => s.structureType === STRUCTURE_RAMPART).length) {
                tiles[i].createConstructionSite(STRUCTURE_RAMPART);
              }
            }
          }
          catch(e) {
            console.log(`Bug while placing ramparts around the controller ${JSON.stringify(e)}`);
          }
        }
    }
  }
}
