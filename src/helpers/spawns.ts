export class SpawnsHelper
{


  static spawnAvailable(room: Room)
  {
    return this.getAvailableSpawns(room).length > 0;
  }

  static getAvailableSpawns(room: Room)
  {
    return room.spawns.filter((s: StructureSpawn) => !s.isSpawning && !s.spawning);
  }


  static requestSpawn(pID: number, room: Room, body: any[], memory: any, mKey: string)
  {
    if(!Memory.spawnQueue[room.name]) {
      Memory.spawnQueue[room.name] = [];
    }

    Memory.spawnQueue[room.name].push({
      pID: pID,
      room: room.name,
      body: body,
      memory: memory,
      mKey: mKey  // The meta key to add the creep to.
    });
  }

  static spawnCreep(room: Room, body: any, memory: any, namePrefix: string)
  {

    if(this.spawnAvailable(room)) {
      let spawn: StructureSpawn = this.getAvailableSpawns(room)[0];
      let name = namePrefix + '_' + Game.time;
      if(!memory) {
        memory = {};
      }
      const result = spawn.spawnCreep(body, name, {memory: memory});
      if(result === OK) {
        spawn.isSpawning = true;
        return name;
      }
      else {
        // if(room.name === 'W47S31') {
        //   console.log(result);
        // }
      }
    }

    return '';
  }
}
