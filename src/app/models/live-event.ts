import { TimedEvent } from '../models/timed-event';
import { Heater } from '../models/heater';
import { Relay } from '../models/relay';

export class LiveEvent {
    event: TimedEvent;
    heater: Heater;
    relay: Relay;
}

