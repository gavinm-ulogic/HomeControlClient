import { Sensor } from './sensor';
import { Heater } from './heater';

export class Room {
    groupId: number;
    heaters: Heater[];
    id: number;
    name: string;
    sensors: Sensor[];
    tempCurrent: number;
    tempTarget: number;
    tempMin: number;
    tempMax: number;
    summary: string;

    static mapMany(source : any): Room[] {
        let newList: Room[] = [];
        for (let value of source) {
            let room = this.map(value);
            if (room) {
                newList.push(room);
            }
        }
        return newList;
    }

    static map(source : any) {
        let room = new Room();
        for (let key of Object.keys(source)) {
            room[key] = source[key];
        }
        return room;
    }     

    getTempClass() {
        if (this.tempCurrent === -999) { return ''; }
        let iPos = Math.min(25, Math.max(4, Math.floor(this.tempCurrent)));
        return 'temperature-' + iPos;
    }
}
