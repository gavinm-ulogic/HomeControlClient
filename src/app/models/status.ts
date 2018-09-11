import { LiveEvent } from '../models/live-event';
import { Sensor } from './sensor';

export class Status {
    liveEvents: LiveEvent[];
    soonEvents: LiveEvent[];
    sensors: Sensor[];
}
