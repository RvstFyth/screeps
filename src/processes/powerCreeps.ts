import { Process } from "ROS/process";
import {N3RD } from "powercreeps/n3rd"

export class PowerCreeps extends Process
{


    public run()
    {
        if(Game.powerCreeps['N3RD'] && Game.powerCreeps['N3RD'].ticksToLive) {
            N3RD.run(Game.powerCreeps['N3RD']);
        }
        else {
            // const powerSpawn: StructurePowerSpawn|null = Game.getObjectById('XXX');
            // if(powerSpawn) {
            //     Game.powerCreeps['N3RD'].spawn(powerSpawn);
            // }
        }

        // Game.powerCreeps['test'].spawn(Game.getObjectById('5ccb8fd090799614a21cad30'));
        if(Game.powerCreeps['test'] && Game.powerCreeps['test'].ticksToLive) {
            if(Game.flags['test']) {
                const pc = Game.powerCreeps['test'];
                pc.moveTo(Game.flags['test'].pos);
            }
        }
    }
}
