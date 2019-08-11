export class ConsoleHelper
{

    static commands = <{[type: string]: Function}> {};
    static helpText = <{[type: string]: string}> {};

    static registerCommand(name: string, callback: Function, helpText: string = '')
    {
        if(!this.commands[name]) {
            this.commands[name] = callback;
            this.helpText[name] = helpText;
        }
        else {
            console.log(`Command ${name} already exists`);
        }
    }

    static help(name: string = '')
    {
        if(this.commandExists(name) && this.helpText[name]) {
            console.log(`<span style="color:cyan"><b>${name}</b></span>: ${this.helpText[name]}`)
        }
        else {
            for(let i in this.commands) {
                const name = i;
                console.log(`<span style="color:cyan"><b>${name}</b></span>: ${this.helpText[name]}`)
            }
        }
    }

    static commandExists(name: string)
    {
        return typeof this.commands[name] !== 'undefined';
    }

    static execute(name: string, args: any[])
    {
        if(this.commandExists(name)) {
            this.commands[name](args);
        }
    }
}
