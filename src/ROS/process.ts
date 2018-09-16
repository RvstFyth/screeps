export class Process
{
  ID: number;
  meta: any;
  suspendedTill: number;
  state: string;
  parentID: number;
  name: string;

  constructor(ID: number, name: string, meta: any, parentID: number, suspendedTill: number) {
    this.ID = ID;
    this.name = name;
    this.meta = meta;
    this.parentID = parentID;
    this.suspendedTill = suspendedTill;
    this.state = 'active';
  }

  run()
  {

  }
}
