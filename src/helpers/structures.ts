export class StructuresHelper
{

  static planRoom(room: Room)
  {
    const upgradersSpots = this.defineUpgraderSpots(room, 3);
    const roadTiles = this.buildRoads(room, upgradersSpots);

  }

  // Needs to have vision in the room!
  static remoteRoads(source: Source, mainRoom: Room)
  {
    if(mainRoom.controller) {
      const path = source.room.findPath(source.pos, mainRoom.controller.pos, {
        ignoreCreeps: true,
        ignoreRoads: true,
        ignoreDestructibleStructures: true
      });

      for(let i in path) {
        //source.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        source.room.visual.circle(path[i].x, path[i].y, {stroke: 'gray'})
      }
    }
  }

  static getRoadTilesForRemote(source: Source, mainRoom: Room)
  {
    if(mainRoom.storage) {
      const path = source.room.findPath(source.pos, mainRoom.storage.pos, {
        ignoreCreeps: true,
        ignoreRoads: true,
        ignoreDestructibleStructures: true
      });
      // Return one long string '0112|0212' translates to x:1,y:12 & x:2,y:12
      let output = '';
      for(let i in path) {
        //source.room.createConstructionSite(path[i].x, path[i].y, STRUCTURE_ROAD);
        //source.room.visual.circle(path[i].x, path[i].y, {stroke: 'gray'})
        output += '';
      }
    }
  }

  static defineUpgraderSpots(room: Room, range: number) : RoomPosition[]
  {
    if(typeof room.controller !== 'undefined') {
      let x = room.controller.pos.x,
          y = room.controller.pos.y,
          validTiles = [];

      let targets = room.lookForAtArea(LOOK_TERRAIN, y-range, x-range, y+range, x+range, true).filter((t: any) => t.terrain !== 'wall');
      for(let i in targets) {
        if(room.controller.pos.getRangeTo(targets[i].x, targets[i].y) <= range) {
            if(!room.lookForAt(LOOK_STRUCTURES, targets[i].x, targets[i].y).filter((s: any) => s.structureType === STRUCTURE_WALL).length) {
              room.visual.circle(targets[i].x, targets[i].y, {stroke: 'blue'});
              validTiles.push(new RoomPosition(targets[i].x, targets[i].y, room.name));
              // {x: targets[i].x, y: targets[i].y}
            }
        }
      }
      return validTiles;
    }

    return [];
  }

  static placeContainerNearSources(room: Room)
  {
    for(let i in room.sources) {
      let tmp = [...room.sources[i].pos.findInRange(room.containers, 2), ...room.sources[i].pos.findInRange(FIND_CONSTRUCTION_SITES, 2, {filter: (c: ConstructionSite) => c.structureType === STRUCTURE_CONTAINER})];
      if(tmp.length) {
        continue;
      }
      if(typeof room.controller !== 'undefined') {
        let path: PathStep[] = room.findPath(room.controller.pos, room.sources[i].pos, {
            ignoreCreeps: true,
            ignoreRoads: true,
            ignoreDestructibleStructures: true
        });
        let lastStep: PathStep = path[path.length - 2];
        room.createConstructionSite(lastStep.x, lastStep.y, STRUCTURE_CONTAINER);
        // room.visual.circle(lastStep.x, lastStep.y, {stroke: 'red'});
      }
    }
  }

  static buildRoads(room: Room, upgraderTiles: any)
  {
    const sources: Source[] = room.find(FIND_SOURCES);
    const spawns = room.find(FIND_STRUCTURES, {
      filter: (s: any) => s.structureType === STRUCTURE_SPAWN
    });

    let uniqueTiles: PathStep[] = [];
    let uniqueTilesHashes: any = [];

    // Paths from sources => spawn
    for(let i in sources) {
      let path: PathStep[] = room.findPath(spawns[0].pos, sources[i].pos, {
          ignoreCreeps: true,
          ignoreRoads: true,
          ignoreDestructibleStructures: false
      });
      for(let p in path) {
        if(!uniqueTilesHashes[path[p].x.toString()+ path[p].y.toString()]) {
            uniqueTiles.push(path[p]);
            uniqueTilesHashes[path[p].x.toString()+ path[p].y.toString()] = true;
        }
      }
    }

    // Path from controller => spawn
    if(typeof room.controller !== 'undefined') {
      let path: PathStep[] = room.controller.pos.findPathTo(spawns[0], {
          ignoreCreeps: true,
          ignoreRoads: true,
          ignoreDestructibleStructures: true
      });
      for(let p in path) {
        if(!uniqueTilesHashes[path[p].x.toString()+ path[p].y.toString()]) {
          // Calculate a path to the controller, but remove the tiles that are defined as upgraderspots.
          if(!upgraderTiles.filter((s: any) => s.x === path[p].x && s.y === path[p].y).length) {
            uniqueTiles.push(path[p]);
            uniqueTilesHashes[path[p].x.toString()+ path[p].y.toString()] = true;
          }
        }
      }
    }
    // console.log(uniqueTiles.length);

    // HIGHLY EXPERIMENTAL
    // paths from sources => controller
    if(typeof room.controller !== 'undefined') {
      for(let i in sources) {
        let path: PathStep[] = room.findPath(room.controller.pos, sources[i].pos, {
            ignoreCreeps: true,
            ignoreRoads: false,
            ignoreDestructibleStructures: false
        });
        for(let p in path) {
          if(!uniqueTilesHashes[path[p].x.toString()+ path[p].y.toString()]) {
            if(!upgraderTiles.filter((s: any) => s.x === path[p].x && s.y === path[p].y).length) {
              uniqueTiles.push(path[p]);
              uniqueTilesHashes[path[p].x.toString()+ path[p].y.toString()] = true;
            }
          }
        }
      }
    }


    // Draw the paths
    for(let i in uniqueTiles) {
      room.visual.circle(uniqueTiles[i].x, uniqueTiles[i].y, {stroke: 'gray'})
    }
  }
}
