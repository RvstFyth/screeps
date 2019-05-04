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
  nuker: StructureNuker|undefined
  powerSpawn: StructurePowerSpawn|undefined
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


interface Game {
  powerCreeps: {[key:string] : PowerCreep}
}

interface PowerCreep {
  name: string;
  id: string;
  ticksToLive: undefined | number;
  pos: RoomPosition;
  room: Room;
  carry: {[key: string] : any};
  carryCapacity: number;
  memory: {spawnID: string};
  powers: PowerCreepPowers;
  shard: string;

  renew(target: StructurePowerSpawn | StructurePowerBank) : OK | ERR_NOT_OWNER | ERR_BUSY | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE;

  spawn(target: StructurePowerSpawn | StructurePowerBank) : OK | ERR_NOT_OWNER | ERR_BUSY | ERR_TIRED | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE;

  moveTo(target: Structure | RoomPosition): OK | ERR_NOT_IN_RANGE;

  enableRoom(target: StructureController) : OK | ERR_NOT_OWNER | ERR_INVALID_TARGET | ERR_NOT_IN_RANGE;

  usePower(power: PowerConstant, target?: RoomObject | RoomPosition): ScreepsReturnCode;

  transfer(target: Structure,resourceType: any): ScreepsReturnCode
}

interface PowerCreepPowers {
  [powerID: number]: {
      level: number;
      cooldown: number | undefined;
  };
}

type PowerConstant =
    | PWR_GENERATE_OPS
    | PWR_OPERATE_SPAWN
    | PWR_OPERATE_TOWER
    | PWR_OPERATE_STORAGE
    | PWR_OPERATE_LAB
    | PWR_OPERATE_EXTENSION
    | PWR_OPERATE_OBSERVER
    | PWR_OPERATE_TERMINAL
    | PWR_OPERATE_SPAWN
    | PWR_OPERATE_TOWER
    | PWR_DISRUPT_SPAWN
    | PWR_DISRUPT_TOWER
    | PWR_DISRUPT_SOURCE
    | PWR_SHIELD
    | PWR_REGEN_SOURCE
    | PWR_REGEN_MINERAL
    | PWR_DISRUPT_TERMINAL
    | PWR_OPERATE_POWER
    | PWR_FORTIFY
    | PWR_OPERATE_CONTROLLER;

type PWR_GENERATE_OPS = 1;
type PWR_OPERATE_SPAWN = 2;
type PWR_OPERATE_TOWER = 3;
type PWR_OPERATE_STORAGE = 4;
type PWR_OPERATE_LAB = 5;
type PWR_OPERATE_EXTENSION = 6;
type PWR_OPERATE_OBSERVER = 7;
type PWR_OPERATE_TERMINAL = 8;
type PWR_DISRUPT_SPAWN = 9;
type PWR_DISRUPT_TOWER = 10;
type PWR_DISRUPT_SOURCE = 11;
type PWR_SHIELD = 12;
type PWR_REGEN_SOURCE = 13;
type PWR_REGEN_MINERAL = 14;
type PWR_DISRUPT_TERMINAL = 15;
type PWR_OPERATE_POWER = 16;
type PWR_FORTIFY = 17;
type PWR_OPERATE_CONTROLLER = 18;
type RESOURCE_OPS = "ops";
type FIND_HOSTILE_POWER_CREEPS = 121;
type FIND_MY_POWER_CREEPS = 120;

declare const PWR_GENERATE_OPS: 1;
declare const PWR_OPERATE_SPAWN: 2;
declare const PWR_OPERATE_TOWER: 3;
declare const PWR_OPERATE_STORAGE: 4;
declare const PWR_OPERATE_LAB: 5;
declare const PWR_OPERATE_EXTENSION: 6;
declare const PWR_OPERATE_OBSERVER: 7;
declare const PWR_OPERATE_TERMINAL: 8;
declare const PWR_DISRUPT_SPAWN: 9;
declare const PWR_DISRUPT_TOWER: 10;
declare const PWR_DISRUPT_SOURCE: 11;
declare const PWR_SHIELD: 12;
declare const PWR_REGEN_SOURCE: 13;
declare const PWR_REGEN_MINERAL: 14;
declare const PWR_DISRUPT_TERMINAL: 15;
declare const PWR_OPERATE_POWER: 16;
declare const PWR_FORTIFY: 17;
declare const PWR_OPERATE_CONTROLLER: 18;
declare const RESOURCE_OPS: "ops";
declare const FIND_HOSTILE_POWER_CREEPS: 121;
declare const FIND_MY_POWER_CREEPS: 120;
