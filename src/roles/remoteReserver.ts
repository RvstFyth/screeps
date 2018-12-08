export class RemoteReserver
{
  static run(creep: Creep, targetRoom: string)
  {
    if(creep.room.name !== targetRoom) {
      creep.moveTo(new RoomPosition(25,25,targetRoom), {
        reusePath: 5,
        range: 23
      });
    }
    else {
      if(creep.room.controller) {
        if(!creep.pos.isNearTo(creep.room.controller)) {
          creep.moveTo(creep.room.controller, {
            maxRooms:1
          });
        }
        else {
          creep.reserveController(creep.room.controller);
          if(creep.room.controller.sign && creep.room.controller.sign.username !== 'GimmeCookies') {
            creep.signController(creep.room.controller, '#overlords');
          }
        }
      }
    }
  }

  static defineBodyParts(room: Room)
  {
    return [CLAIM,CLAIM,MOVE,MOVE];
  }
}
