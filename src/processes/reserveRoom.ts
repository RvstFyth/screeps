import {Process} from '../ROS/process'
import {SpawnsHelper} from '../helpers/spawns'
import {RemoteReserver} from '../roles/remoteReserver'

export class ReserveRoom extends Process
{


  run()
  {
    if(this.suspendedTill && Game.time < this.suspendedTill) {
      return;
    }
    else {
      this.suspendedTill = 0;
    }

    if(!this.suspendedTill && Game.rooms[this.meta.target] && Game.rooms[this.meta.target].hostiles) {
      const invaders: Creep[] = Game.rooms[this.meta.target].hostiles.filter((c: Creep) => c.owner.username.toLowerCase() === 'invader');
      if(invaders.length && invaders.length === Game.rooms[this.meta.target].hostiles.length) {
        const maxInvader: Creep = _.max(invaders, i => i.ticksToLive);
        if(maxInvader.ticksToLive) {
           this.suspendedTill = Game.time + maxInvader.ticksToLive
        }
      }
    }

    const room = Game.rooms[this.meta.target];
    const needClaimer = !room || !room.controller || !room.controller.reservation || room.controller.reservation.ticksToEnd < 1000;

    if(needClaimer && (!this.meta.creep || !Game.creeps[this.meta.creep])) {
      if(this.meta.target === 'W59S17') {
        this.state = 'killed';
      }
      if(SpawnsHelper.spawnAvailable(Game.rooms[this.meta.room])) {
        SpawnsHelper.requestSpawn(this.ID, Game.rooms[this.meta.room], RemoteReserver.defineBodyParts(room), {role: 'remoteReserver'}, 'creep');
        //this.meta.creep = SpawnsHelper.spawnCreep(Game.rooms[this.meta.room], RemoteReserver.defineBodyParts(Game.rooms[this.meta.room]), {role: 'remoteReserver'}, this.ID.toString());
      }
    }
    else if(Game.creeps[this.meta.creep] && Game.creeps[this.meta.creep].spawning) {

    }
    else if(Game.creeps[this.meta.creep]) {
      if(room && room.controller && room.controller.reservation && room.controller.reservation.username !== 'GimmeCookies') {
        Game.creeps[this.meta.creep].suicide();
        this.state = 'killed';
      }
      RemoteReserver.run(Game.creeps[this.meta.creep], this.meta.target);
    }
  }

}
