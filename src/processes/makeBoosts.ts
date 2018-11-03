import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
// META: room, boost
export class MakeBoosts extends Process
{

  run()
  {
      if(!this.meta.amount) {
        this.meta.amount = 1000;
      }
      // this.state = 'killed';
      // this.meta.labs = [];
      const room = Game.rooms[this.meta.room];
      // console.log("Making "+this.meta.boost);
      if(!this.meta.ingredients || !this.meta.ingredients.length) {
        this.meta.ingredients = global.BOOST_COMPONENTS[this.meta.boost];
        this.meta.currentIngredient = 0;
      }

      // Find labs to use
      if(room.labs.length > 2 && (!this.meta.labs || !this.meta.labs.length)) {
        try {
          this.defineLabs(room.labs);
        }
        catch(e) {
          console.log("Failed to define labs: "+e.message);
          this.state = 'killed';
        }
      }

      if(this.meta.labs) {

        const labs: StructureLab[] = this.getLabs();
        if(labs[1].mineralAmount === labs[1].mineralCapacity && labs[2].mineralAmount === labs[2].mineralCapacity) {
          this.meta.shouldBoost = true;
        }
        const filledLabs = room.labs.filter((l: StructureLab) => l.mineralAmount > 0);
        if(this.meta.shouldBoost && !labs[0].cooldown && labs[1].mineralAmount > 0 && labs[2].mineralAmount > 0) {
          labs[0].runReaction(labs[1], labs[2]);
          const labsIDs = labs.map((l: StructureLab) => l.id);
          const extraLabs = room.labs.filter((l: StructureLab) => labsIDs.indexOf(l.id) < 0);
          if(extraLabs.length) {
            for(let i = 0, iEnd = extraLabs.length; i < iEnd; i++) {
              extraLabs[i].runReaction(labs[1], labs[2]);
            }
          }
        }
        else if(this.meta.shouldBoost && (labs[1].mineralAmount === 0 || labs[2].mineralAmount === 0)) {
          this.meta.shouldBoost = false;
          if(Game.creeps[this.meta.transporter]) {
            Game.creeps[this.meta.transporter].suicide();
          }
          this.state = 'killed';
          global.OS.kernel.addProcess('emptyLabs', {room: this.meta.room, creep: this.meta.transporter}, 0)
        }
        else if(this.meta.shouldBoost) {
          if(Game.creeps[this.meta.transporter] && !Game.creeps[this.meta.transporter].spawning) {
            if(_.sum(Game.creeps[this.meta.transporter].carry) === 0) {
              const containers = room.containers.filter((c: StructureContainer) => _.sum(c.store) > 0);
              if(containers.length) {
                if(Game.creeps[this.meta.transporter].withdraw(containers[0], _.findKey(containers[0].store) as ResourceConstant) === ERR_NOT_IN_RANGE) {
                  Game.creeps[this.meta.transporter].moveTo(containers[0]);
                }
              }
              else {
                this.handleTransporter(room, labs);
              }
            }
            else {
              let target;
              if(room.storage) {
                target = room.storage;
              }
              else if(room.terminal) {
                target = room.terminal;
              }
              else {
                target = null;
              }

              if(target) {
                if(!Game.creeps[this.meta.transporter].pos.isNearTo(target)) {
                  Game.creeps[this.meta.transporter].moveTo(target);
                }
                else {
                  Game.creeps[this.meta.transporter].transfer(target, _.findKey(Game.creeps[this.meta.transporter].carry) as ResourceConstant);
                }
              }
            }
          }
        }
        else {
          this.handleTransporter(room, labs);
        }
      }
  }

  handleTransporter(room: Room, labs: StructureLab[])
  {
    if(!Game.creeps[this.meta.transporter] && (!this.meta.shouldBoost || (this.meta.shouldBoost && labs[0].mineralAmount > 450))) {
      if(SpawnsHelper.spawnAvailable(room)) {
        this.meta.transporter = SpawnsHelper.spawnCreep(room,
          [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
          {role: 'mineralTransporter'}, this.ID.toString()
        )
      }
    }
    else if(Game.creeps[this.meta.transporter] && Game.creeps[this.meta.transporter].spawning) {

    }
    else if(Game.creeps[this.meta.transporter]) {
      const creep = Game.creeps[this.meta.transporter];
      if(this.meta.shouldBoost) {
        // Empty final lab if the amount > carryCapacity
        if(_.sum(creep.carry) === 0) {
        // suicide with less then 50 ticks, as we dont want him to die during the transport!
          if(creep.ticksToLive && creep.ticksToLive < 50) creep.suicide();
          const withdrawMin = labs[1].mineralAmount === 0 || labs[2].mineralAmount === 0 ? 0 : creep.carryCapacity;
          if(!creep.pos.isNearTo(labs[0])) {
              creep.moveTo(labs[0]);
          }
          if(labs[0].mineralAmount >= withdrawMin || (labs[0].mineralAmount > 0 && (labs[1].mineralAmount === 0 || labs[2].mineralAmount === 0))) {
            creep.withdraw(labs[0], this.meta.boost);
          }
          else {
            const labsIDs = labs.map((l: StructureLab) => l.id);
            const extraLabs = room.labs.filter((l: StructureLab) => labsIDs.indexOf(l.id) < 0 && l.mineralAmount >= withdrawMin);
            if(extraLabs.length) {
              if(!creep.pos.isNearTo(extraLabs[0])) {
                creep.moveTo(extraLabs[0]);
              }
              else {
                  creep.withdraw(extraLabs[0], this.meta.boost);
              }
            }
          }
        }
        else {
          if(creep.room.storage) {
            if(!creep.pos.isNearTo(creep.room.storage)) {
              creep.moveTo(creep.room.storage);
            }
            else {
              creep.transfer(creep.room.storage, this.meta.boost);
            }
          }
        }
      }
      else {
        // creep.say("A");
        if(_.sum(creep.carry) === 0) {
          let mineral: ResourceConstant|null;
          let amount;

          if(!labs[1].mineralAmount || labs[1].mineralAmount < this.meta.amount) {
            mineral = this.meta.ingredients[0];
            amount = this.meta.amount - labs[1].mineralAmount > creep.carryCapacity ? creep.carryCapacity : this.meta.amount - labs[1].mineralAmount;
          }
          else if(!labs[2].mineralAmount || labs[2].mineralAmount < this.meta.amount) {
            mineral = this.meta.ingredients[1];
            amount = this.meta.amount - labs[2].mineralAmount > creep.carryCapacity ? creep.carryCapacity : this.meta.amount - labs[2].mineralAmount;
          }
          else {
            mineral = null;
            this.meta.shouldBoost = true;
            amount = 0;
          }
          if(mineral) {
            if(creep.room.storage && creep.room.storage.store[mineral]) {
              const amountInStorage = creep.room.storage.store[mineral];
              if(amountInStorage && amountInStorage < creep.carryCapacity) {
                amount = amountInStorage;
              }
              if(!creep.pos.isNearTo(creep.room.storage)) {
                creep.moveTo(creep.room.storage);
              }
              else {
                const r = creep.withdraw(creep.room.storage, mineral, amount);
              }
            }
            else if(creep.room.terminal && creep.room.terminal.store[mineral]) {
              if(!creep.pos.isNearTo(creep.room.terminal)) {
                creep.moveTo(creep.room.terminal);
              }
              else {
                creep.withdraw(creep.room.terminal, mineral, amount);
              }
            }
            else {
               // ???
            }
          }
        }
        else { // Creep carries resources
          let lab,
              mineral;
          if(labs[1].mineralAmount < this.meta.amount) {
            lab = 1;
            mineral = this.meta.ingredients[0];
          }
          else if(labs[2].mineralAmount < this.meta.amount) {
            lab = 2;
            mineral = this.meta.ingredients[1];
          }
          if(lab && mineral) {
            if(!creep.pos.isNearTo(labs[lab])) {
              creep.moveTo(labs[lab]);
            }
            else {
              creep.transfer(labs[lab], mineral);
            }
          }
        }
      }
    }
  }

  getLabs()
  {
    return this.meta.labs.map((id: string) => Game.getObjectById(id));
  }

  defineLabs(labs: StructureLab[]) {
    this.meta.labs = [];
    const labRanges = [];
    for (const labTarget of labs) {
        const labTargetsInRange = labTarget.pos.findInRange(labs, 2);

        const labRange: any = {
            lab: labTarget,
            labsInRange: labTargetsInRange.length
        };

        labRanges.push(labRange);
    }

    labRanges.sort((a, b) =>
        b.labsInRange
        -
        a.labsInRange
    );

    labs[0].room.visual.circle(labRanges[0].lab.pos, {stroke: 'red'});
    labs[1].room.visual.circle(labRanges[1].lab.pos, {stroke: 'red'});

    this.meta.labs.push(labRanges[2].lab.id);
    this.meta.labs.push(labRanges[0].lab.id);
    this.meta.labs.push(labRanges[1].lab.id);
  }

  // Old defineLabs method
  getLabTargets(room: Room)
  {
    this.meta.labs = [];
    for(let n in room.labs) {
      if(room.labs[n].mineralAmount === 0) {
        // Find 2 empty labs for ingredients within range
        const labsInRange = room.labs[n].pos.findInRange(room.labs.filter((l: StructureLab) => l.id !== room.labs[n].id && l.mineralAmount === 0), 2);
        if(labsInRange.length > 1) {
          this.meta.labs.push(room.labs[n].id);
          this.meta.labs.push(labsInRange[0].id);
          this.meta.labs.push(labsInRange[1].id);
          break;
        }
      }
    }
  }
}
