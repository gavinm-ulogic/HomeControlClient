import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnInit } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { HeatingService } from '../../services/heating.service';
import { TimedEvent } from '../../models/timed-event';

@Component({
  selector: 'app-week-timer',
  templateUrl: './week-timer.component.html',
  styleUrls: ['./week-timer.component.scss']
})
export class WeekTimerComponent implements OnInit {
    @Input() subject: any;
    @Input() parent: any;
    @Input() viewLevel: number;
    @Output() onTimerChange = new EventEmitter<any>();

    public subjectDayList: number[] = [];
    public parentDayList: number[] = [];

    public subjectEvents: TimedEvent[] = [];
    public newEvents: TimedEvent[];

    public selectedEvent = null;
    
    // public newEvent: string = '';
    public newEventFilter = 0;

    constructor(
        public heatingService: HeatingService
    ) {}

    private setOneDayList(eventList: any[]) {
        if (!eventList) { return null; }
        let newList: number[] = null;
        for (let i = 0; i < eventList.length; i++) {
            let startDate = new Date(eventList[i].timeStart);
            let periodYear = startDate.getFullYear();
            if (!newList) {
                newList = [periodYear];
            } else if (periodYear < newList[0]) {                   // Slot in first place
                newList.splice(0, 0, periodYear);
            } else {
                for (let j = 0; j < newList.length; j++) {
                    if (periodYear === newList[j]) { break; }       // Already got this day
                    if (periodYear > newList[j] && (j === newList.length - 1 || periodYear < newList[j])) {
                        newList.splice(j + 1, 0, periodYear);       // Slot in range or at end
                    }
                }
            }
        }
        return newList;
    };

    private getEventSet(subjectId: number, isGroup: boolean, eventSet: TimedEvent[], dayList: number[]) {
        this.heatingService.getSubjectEvents(subjectId, isGroup)
            .subscribe(
                (events: TimedEvent[]) => {
                    eventSet.push.apply(eventSet, events);
                    dayList.push.apply(dayList, this.setOneDayList(eventSet));
                },
                (err: any) => {
                    LoggerService.log(err);
                });
    };

    ngOnInit() {
      LoggerService.log('Week Timer');
    }

    ngOnChanges() {
        LoggerService.log('WeekTimer OnChanges');
        this.init();
    }

    private init() {
        this.subjectEvents = [];
        this.subjectDayList = [];
        this.getEventSet(this.subject.id, false, this.subjectEvents, this.subjectDayList);
    }

    public addNewEvent(region: string, filter: number) {
        if (!this.newEvents) { this.newEvents == []; }
        this.newEventFilter = filter;
        let ne = new TimedEvent();
        ne.id = 0;
        ne.subjectType = 'heater';
        ne.subjectId = this.subject.id;
        ne.timeStart = new Date();
        if (ne.timeStart.getHours() > 20) {
            ne.timeStart.setHours(20);
        }
        if (filter) { ne.timeStart.setFullYear(filter); }
        ne.timeEnd = new Date(ne.timeStart);
        ne.timeEnd.setHours(ne.timeStart.getHours() + 3);
        ne.action = 'timed';
        this.subjectEvents.push(ne);
        this.subjectDayList = this.setOneDayList(this.subjectEvents);
        this.selectedEvent = ne;
    };

    public handleEventSelected($event) {
        this.selectedEvent = $event;
    }
}
