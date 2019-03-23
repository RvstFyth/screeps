import { Process } from "ROS/process";

export class Observer extends Process
{

    // Just scan for powerbanks now.
    private init()
    {
        this.meta.rooms = [];
        const [x,y] = this.meta.room.match(/\d+/g).map((n: string) => parseInt(n));
        const roomLetters = /^([WE])[0-9]+([NS])[0-9]+$/.exec(this.meta.room);
        if(roomLetters) {
            const HORIZONTAL = roomLetters[1];
            const VERTICAL = roomLetters[2];
            for (let a = x - OBSERVER_RANGE; a < x + OBSERVER_RANGE; a++) {
                for (let b = y - OBSERVER_RANGE; b < y + OBSERVER_RANGE; b++) {
                    let hor = HORIZONTAL;
                    let vert = VERTICAL;
                    let n = a;
                    if (a < 0) { // swap horizontal letter
                        hor = hor === 'W' ? 'E' : 'W';
                        n = Math.abs(a) - 1;
                    }
                    hor += n;
                    n = b;
                    if (b < 0) {
                        vert = vert === 'N' ? 'S' : 'N';
                        n = Math.abs(b) - 1;
                    }
                    vert += n;
                    const room = hor + vert;
                    if (room !== this.meta.room) {
                        this.meta.rooms.push(room);
                    }
                }
            }
        }
        this.meta.observed = false;
        this.meta.initialized = true;
    }

    public run()
    {
        // this.state = 'killed';
        try {
            this.run2();
        } catch (e) {
            console.log(`Bug in process observer`);
        }
    }

    public run2()
    {
        if(!this.meta.initialized) {
            this.init();
        }
        if(this.meta.rooms.length) {
            const room = Game.rooms[this.meta.room];
            if(room && room.observer) {
                if(this.meta.observed) {
                    const oRoom = Game.rooms[this.meta.observed];
                    if(oRoom) {
                        // Scan for powerbanks
                        const powerbanks = oRoom.find(FIND_STRUCTURES, {
                            filter: (s: StructurePowerBank) => s.structureType === STRUCTURE_POWER_BANK
                                && s.ticksToDecay > 4300 && !s.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length
                        });

                        if(powerbanks.length) {
                            console.log(`Found powerBank in ${oRoom.name}`);
                        }
                    }
                }

                const observer = room.observer;
                const target = this.meta.rooms.shift();
                if(observer.observeRoom(target) === OK) {
                    this.meta.rooms.push(target);
                    this.meta.observed = target;
                }
            }
            else {
                this.state = 'killed';
            }
        }
    }
}
