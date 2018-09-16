export class Scout
{

  static run(creep: Creep, targetRoom: string)
  {
    if(creep.room.name !== targetRoom){
      creep.moveTo(new RoomPosition(25,25,targetRoom), {
        reusePath: 17,
          range: 20,
          costCallback: function(roomName: string, costMatrix: CostMatrix) {
            if(roomName === 'W55S33') {
              return false;
            }

            if(roomName === 'W56S33') {
              costMatrix.set(49,40,255);
              costMatrix.set(49,41,255);
            }

            const sourceKeepersLiar = creep.room.find(FIND_STRUCTURES, {
              filter: (s: Structure) => s.structureType === STRUCTURE_KEEPER_LAIR
            });

            if(sourceKeepersLiar.length) {
              for(let i in sourceKeepersLiar) {
                const sX = sourceKeepersLiar[i].pos.x;
                const sY = sourceKeepersLiar[i].pos.y;

                for(let y = (sY - 5), yEnd = (sY + 5); y < yEnd; y++) {
                  for(let x = (sX - 5), xEnd = (sX + 5); x < xEnd; x++) {
                    costMatrix.set(x,y,60);
                  }
                }
                costMatrix.set(sX,sY,255);
              }
            }

            return costMatrix;
          }
      });
    }
    else {
      if(!Memory.scoutReports) {
        Memory.scoutReports = {};
      }
      if(!Memory.scoutReports[targetRoom]) {
        Memory.scoutReports[targetRoom] = {
          time: Game.time,
          owner: creep.room.controller ? creep.room.controller.owner : '',
          sources: creep.room.find(FIND_SOURCES),
          mineral: creep.room.find(FIND_MINERALS)[0].mineralType
        }
      }

      if(creep.room.controller) {
        if(!creep.pos.isNearTo(creep.room.controller)) {
          creep.moveTo(creep.room.controller);
        }
      }
    }
  }
}
