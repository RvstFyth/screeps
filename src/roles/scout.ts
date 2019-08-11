export class Scout {
  static run(creep: Creep, targetRoom: string) {
      if (creep.room.name !== targetRoom) {
          creep.moveToRoom(targetRoom);
      }
      else {
          // Save scout report
          const room = Game.rooms[targetRoom];
          if (room) {
              const sources = room.find(FIND_SOURCES);
              const minerals = room.find(FIND_MINERALS);
              let mineral = '';
              if (minerals.length) mineral = minerals[0].mineralType;
              let owner = '';
              if (room.controller && room.controller.owner && room.controller.owner.username) owner = room.controller.owner.username;
              const report = {
                  sources: sources.map((s: Source) => s.id),
                  mineral: mineral,
                  owner: owner,
                  ts: Game.time
              }
              Memory.scoutReports[room.name] = report;
          }
      }
  }
}
