// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here
declare var global: any;

interface RoomVisual
{
  resource(type: ResourceConstant, x: number, y: number, size: number) : any,
  fluid(type: string, x: number, y: number, size: number) : any,
  mineral(type: string, x: number, y: number, size: number) : any,
  compound(type: string, x: number, y: number, size: number) : any
}

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
  roads: StructureRoad[]
  allies: Creep[]
  mineral: Mineral|undefined
}

interface StructureLab
{
  memory: {state: number, boost: ResourceConstant}
}

interface RoomObject
{
  say(value: string) : any
}

interface Creep
{
  moveToRoom(roomName: string): any;
  _suicide() : any
}

interface RoomPosition
{
  isExitTile() : boolean
}

interface CreepMemory {
    harvesting: boolean | undefined
    upgrader: boolean | undefined
    role: string
    targetID: string | null
    target: string
    targetX: number
    targetY: number
    needBoost: boolean
    boosted: boolean
    initialized: boolean
    arrived: boolean
}
