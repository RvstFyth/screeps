import {Init} from '../processes/init';
import {Process} from './process';
import {Room} from '../processes/room';
import {Towers} from '../processes/towers'
import {Room_Bootstrap} from '../processes/room_bootstrap'
import {Source} from '../processes/source'
import {Transport} from '../processes/transport'
import {ClaimRoom} from '../processes/claimRoom'
import {Mineral} from '../processes/mineral'
import {MakeBoosts} from '../processes/makeBoosts'
import {RemoteMining} from '../processes/remoteMining'
import {ScoutRoom} from '../processes/scoutRoom'
import {ReserveRoom} from '../processes/reserveRoom'
import {EmptyLabs} from '../processes/emptyLabs'
import {SendResources} from '../processes/sendResources'
import {HaulResources} from '../processes/haulResources'
import {UpgradeRoom} from '../processes/upgradeRoom'
import {RepairRoom} from '../processes/repairRoom'
import {Spawns} from '../processes/spawns'
import {Links} from '../processes/links'
import {EmptyTerminal} from '../processes/emptyTerminal'
import {DismantleRoom} from '../processes/dismantleRoom'
import {LootRoom} from '../processes/lootRoom'
import {ProcessPower} from '../processes/processPower'
import {SellResources} from '../processes/sellResources'
import {HarrasRemote} from '../processes/harrasRemote'
import {StockBoostsLab} from 'processes/stockBoostsLab'
import {DismantleWall} from '../processes/dismantleWall'
import {AttackController} from '../processes/attackController'
import {IntershardBuilder} from '../processes/intershardBuilder'
import {IntershardClaim} from '../processes/intershardClaim'
import {IntershardBuilder2} from '../processes/intershardBuilder2'
import {IntershardClaim2} from '../processes/intershardClaim2'
import {AutoMakeBoosts} from '../processes/autoMakeBoosts'
import {SourceKeeperAttacker} from '../processes/sourceKeeperAttacker'
import {AlliResourceRequests} from '../processes/alliResourceRequests'
import {Chemist} from '../processes/chemist';

class ProcessTable
{
    queue: Process[] = new Array()
    completed: Process[] = new Array()
    new: Process[] = new Array()
    killed: Process[] = new Array()
    failed: Process[] = new Array()
}

const Processes = <{[type: string]: any}> {
  'init': Init,
  'room': Room,
  'room_bootstrap': Room_Bootstrap,
  'towers': Towers,
  'source': Source,
  'transport': Transport,
  'claimRoom': ClaimRoom,
  'mineral': Mineral,
  'makeBoosts': MakeBoosts,
  'remoteMining': RemoteMining,
  'scoutRoom': ScoutRoom,
  'reserveRoom': ReserveRoom,
  'emptyLabs': EmptyLabs,
  'sendResources': SendResources,
  'haulResources': HaulResources,
  'upgradeRoom': UpgradeRoom,
  'repairRoom': RepairRoom,
  'spawns': Spawns,
  'links': Links,
  'emptyTerminal': EmptyTerminal,
  'dismantleRoom': DismantleRoom,
  'lootRoom': LootRoom,
  'processPower': ProcessPower,
  'sellResources': SellResources,
  'harrasRemote': HarrasRemote,
  'stockBoostsLab': StockBoostsLab,
  'dismantleWall': DismantleWall,
  'attackController': AttackController,
  'intershardClaim': IntershardClaim,
  'intershardClaim2': IntershardClaim2,
  'intershardBuilder': IntershardBuilder,
  'intershardBuilder2': IntershardBuilder2,
  'autoMakeBoosts': AutoMakeBoosts,
  'sourceKeeperAttacker': SourceKeeperAttacker,
  'alliResourceRequests': AlliResourceRequests,
  'chemist': Chemist
}

export class Kernel
{

  limit: number

  ProcessTable : ProcessTable

  constructor()
  {
    if(!Memory.ROS.nextProcessID || !Memory.ROS.processes.length) {
      Memory.ROS.nextProcessID = 0;
    }
    this.limit = this.defineCpuLimit();
    this.ProcessTable = new ProcessTable();
    //this.nextID = Memory.ROS.nextProcessID;
    this.loadProcesses();
  }

  addProcess(name: string, meta: any, parentID: number)
  {
    this.ProcessTable.new.push(new Processes[name](
        Memory.ROS.nextProcessID, name, meta, parentID
    ));
    console.log(`Added process ${name} | ID: ${Memory.ROS.nextProcessID} | Meta: ${JSON.stringify(meta)}`)
    Memory.ROS.nextProcessID++;
  }

  checkIntershardSegment()
  {
    let intershardData = JSON.parse(RawMemory.interShardSegment);
    if(!intershardData[Game.shard.name]) {
      intershardData[Game.shard.name] = {};
    }
    if(!intershardData[Game.shard.name].processes) {
      intershardData[Game.shard.name].processes = [];
    }
    if(intershardData[Game.shard.name] && intershardData[Game.shard.name].processes && intershardData[Game.shard.name].processes.length) {
      // Spawn processes triggered by a other shard.
      for(let p of intershardData[Game.shard.name].processes) {
        this.addProcess(p.name, p.meta, p.parentID);
      }

      // Clear processes list
      intershardData[Game.shard.name].processes = [];
    }
    // Save intershardData to the intershardSegment
    RawMemory.interShardSegment = JSON.stringify(intershardData);
  }

  private intershard()
  {
    for(let i in Game.creeps) {
      const nameParsed = Game.creeps[i].name.split('_');
      if(nameParsed[0] === 'IB' && !this.hasProcessForNameAndMetaKeyValue('intershardBuilder2', 'creep', Game.creeps[i].name)) {
        this.addProcess('intershardBuilder2', {
          creep: Game.creeps[i].name,
          target: nameParsed[1]
        }, 0);
      }
      if(nameParsed[0] === 'IC' && !this.hasProcessForNameAndMetaKeyValue('intershardClaim2', 'creep', Game.creeps[i].name)) {
        this.addProcess('intershardClaim2', {
          creep: Game.creeps[i].name,
          target: nameParsed[1]
        }, 0);
      }
    }
  }

  run()
  {
    this.loadProcesses();
    // this.checkIntershardSegment();
    if(Game.shard.name.toLowerCase() === 'shard3') {
      this.intershard();
    }
    this.limit = this.defineCpuLimit();
    while(true) {
      const p = this.ProcessTable.queue.shift();
      if(!p) {
        break;
      }
      try {
        p.run();
        if(p.state !== 'killed') {
          this.ProcessTable.completed.push(p);
        }
      }
      catch(e) {
        Memory.errors.push({
						n: e.name,
						m: e.message,
            s: e.stack
					});
					console.log(`<span style="color:red">${e.name} : ${e.message}</span> | ${e.fileName}:${e.lineNumber}`);
      }
      if(Game.cpu.getUsed() > this.limit) {
        break;
      }
    }

    this.saveProcessTable();
  }

  loadProcesses()
  {
    if(!Memory.ROS.processes.length && !this.ProcessTable.queue.length) {
        this.addProcess('init', {}, 0);
    }
    else {
      for(let n = 0, nEnd = Memory.ROS.processes.length; n < nEnd; n++) {
          const pr = this.getClassForProcessName(Memory.ROS.processes[n].name);
          pr.name = Memory.ROS.processes[n].name;
          pr.meta = Memory.ROS.processes[n].meta;
          pr.parentID = Memory.ROS.processes[n].parentID;
          pr.suspendedTill = Memory.ROS.processes[n].suspendedTill;
          pr.ID = Memory.ROS.processes[n].ID;

          this.ProcessTable.queue.push(pr);
      }
    }
    Memory.ROS.processes = [];
  }

  hasProcessForNameAndMetaKeyValue(name: string, mKey: string, mValue: string)
  {
    return this.getProcessForNameAndMetaKeyValue(name, mKey, mValue).length > 0;
  }

  getProcessForNameAndMetaKeyValueCLI(name: string, mKey: string, mValue: string)
  {
    return Memory.ROS.processes.filter((s: any) => s.name === name && s.meta[mKey] === mValue);
  }

  getProcessForMetaKeyValueCLI(mKey: string, mValue: string)
  {
    return Memory.ROS.processes.filter((s: any) => s.meta[mKey] === mValue);
  }

  getProcessForNameAndMetaKeyValue(name: string, mKey: string, mValue: string)
  {
    return [...this.ProcessTable.completed, ...this.ProcessTable.new, ...this.ProcessTable.queue]
              .filter(s => s.name === name && s.meta[mKey] === mValue);
  }

  getProcessForID(pID: number)
  {
    return [...this.ProcessTable.completed, ...this.ProcessTable.new, ...this.ProcessTable.queue]
              .filter(s => s.ID === pID)[0];
  }

  saveProcessTable()
  {
    Memory.ROS.processes = [...this.ProcessTable.completed, ...this.ProcessTable.new, ...this.ProcessTable.queue];
    this.ProcessTable.queue = [];//[...this.ProcessTable.completed, ...this.ProcessTable.new];
    this.ProcessTable.new = [];
    this.ProcessTable.completed = [];
    this.ProcessTable.failed = [];
  }

  getClassForProcessName(name: string)
  {
    return new Processes[name]();
  }

  defineCpuLimit()
  {
    return 500;
  }
}
