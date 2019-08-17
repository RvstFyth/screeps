// type shim for nodejs' `require()` syntax
// for stricter node.js typings, remove this and install `@types/node`
declare const require: (module: string) => any;

// add your custom typings here
declare var global: any;

interface MemHack {
  register(): void;
  pretick(): void;
}

interface RawMemory {
  _parsed: any
}

interface Memory {
  stats: any
  remotes: any
  cpu: any
  roomBlacklist: any
  scoutReports: any
  attackedRemotes: any
  triggeredConstruction: boolean
  ROS: any
  lastLOANtime: any
  LOANalliance: any
  errors: any
  spawnQueue: any
  customLabsMem: any
  paths: any
  mySourcesMemory: any
  marketLog: any
  resourceRequests: any
}

interface RoomMemory {
  blueprintType: string;
  blueprintKey: string;
  centerX: number;
  centerY: number;
  boostToProduce: string;
}

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
  nuker: StructureNuker|undefined
  powerSpawn: StructurePowerSpawn|undefined
  buildTarget: ConstructionSite|null
}

interface StructureLab
{
  memory: {state: number, boost: ResourceConstant, boosted: boolean, boostedTS: number}
  boosted: boolean
}

interface RoomObject
{
  say(value: string) : any
}

interface Creep
{
  moveToRoom(roomName: string, ignoreSK?: boolean, prioritizeHighways?:boolean): any;
  _suicide() : any
  flee(targets: any, range:number) : any
  boost(boosts: object) : any|void
}

interface Source
{
  spots: number
  memory: any
}

interface StructureController
{
  spots: RoomPosition[]
  memory: any
  global: any
  isPowerEnabled: boolean
}

interface RoomPosition
{
  isExitTile() : boolean
  isWalkable(ignoreCreeps:boolean) : boolean
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

interface PowerCreep {
    memory: any
}
