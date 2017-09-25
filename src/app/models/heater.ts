import { Sensor } from './sensor';

export class Heater {
    groupId: number;
    id: number;
    name: string;
    relayAddress: string;
    roomId: number;
    sensors: Sensor[];
    State: number;
    tempMax: number;
    type: number;
}
