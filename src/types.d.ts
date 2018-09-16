// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here
declare var global: any;

interface StructureSpawn
{
   isSpawning: boolean
}
interface Room
{
  sources: Source[]
  spawns: StructureSpawn[]
  towers: StructureTower[]
  hostiles: Creep[]
  invaders: Creep[]
  containers: StructureContainer[]
  extensions: StructureExtension[]
  ramparts: StructureRampart[]
  walls: StructureWall[]
  constructionSites: ConstructionSite[]
  extractor: StructureExtractor
  labs: StructureLab[]
  links: StructureLink[]
  recycleContainers: StructureContainer[]
  observer: StructureObserver|undefined
}

interface Creep
{
  moveToRoom(roomName: string): any;
  _suicide() : any
}

interface CreepMemory {
    harvesting: boolean | undefined
    upgrader: boolean | undefined
    role: string
    targetID: string | null
    target: string
    targetX: number
    targetY: number
}
