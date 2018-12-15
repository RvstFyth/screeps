import {Process} from '../ROS/process';
import {SpawnsHelper} from '../helpers/spawns';

export class IntershardDefender extends Process
{
    /**
     * 6 TOUGH, 7 MOVE, 10 RANGED_ATTACK, 6 HEAL, 1 MOVE
     */
    bodyParts: BodyPartConstant[] = [
        TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
        MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,
        RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
        HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE
    ];

    boostsRequired: {} = {
        RESOURCE_CATALYZED_GHODIUM_ALKALIDE: (LAB_BOOST_MINERAL * 6), // TOUGH 180
        RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE: (LAB_BOOST_MINERAL * 8), // MOVE 240
        RESOURCE_CATALYZED_KEANIUM_ALKALIDE: (LAB_BOOST_MINERAL * 10), // RANGED_ATTACK 300
        RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE: (LAB_BOOST_MINERAL * 6) // HEAL 180
    };

    public run()
    {
        try {
            const room = Game.rooms[this.meta.room];
            if(room && room.controller && room.controller.my) {
                this._run(room);
            }
            else {
                this.state = 'killed';
            }
        }
        catch(e) {}
    }

    private init()
    {
        this.meta.transporter = '';
        this.meta.defender = '';
        this.meta.cBoost = 0; // Current boost to deliver index
        this.meta.cLab = '';
        this.meta.deliver = true;
        this.meta.initialized = true;
    }

    private _run(room: Room)
    {
        const transporter = Game.creeps[this.meta.transporter];
        const defender = Game.creeps[this.meta.defender];

        if(this.meta.deliver) {
            if(!transporter && SpawnsHelper.spawnAvailable(room)) {
                SpawnsHelper.requestSpawn(this.ID, room,[
                    CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE
                ], {role: 'intershardTransporter'}, 'transporter');
            }
            else if(transporter && transporter.spawning) {

            }
            else if(transporter){
                this.handleTransporter(transporter);
            }
        }
        if(transporter && !defender) {

        }

        // Defender block. Defender can start spawning when the transporter is being spawned!
    }

    private handleTransporter(creep: Creep)
    {
        if((!this.meta.cLab || !this.meta.cBoost) && this.meta.deliver) {
            if(!this.meta.cBoost) {
                
            }
        }
    }

    private defineBoostAndLab()
    {

    }

    private handleDefender(creep: Creep)
    {

    }
}
