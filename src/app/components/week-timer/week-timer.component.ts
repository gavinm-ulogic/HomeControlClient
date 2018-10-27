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

    public selectedEvent = null;

    public dayFilterArray: any[];
    public dayNewEventArray: any[];
    public dayFilter = 127;
    public repeating: boolean;
    
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

        let self = this;
        this.heatingService.getSubjectEvents(this.subject.id, false)
            .subscribe(
                (events: TimedEvent[]) => {
                    self.subjectEvents = events;
                },
                (err: any) => {
                    LoggerService.log(err);
                });        

        /* tslint:disable:no-bitwise */
        this.dayFilterArray = [
            {name: 'Mon', selected: this.dayFilter & 1, value: 1},
            {name: 'Tue', selected: this.dayFilter & 2, value: 2},
            {name: 'Wed', selected: this.dayFilter & 4, value: 4},
            {name: 'Thu', selected: this.dayFilter & 8, value: 8},
            {name: 'Fri', selected: this.dayFilter & 16, value: 16},
            {name: 'Sat', selected: this.dayFilter & 32, value: 32},
            {name: 'Sun', selected: this.dayFilter & 64, value: 64}
        ];
    }

    public handleEventSelected($event) {
        this.selectedEvent = $event;

        this.setDayFilter(this.selectedEvent.timeStart.getFullYear() < 1000 ? this.selectedEvent.timeStart.getFullYear() : 128)
    }

    setSelectedDayFilter(filter: number) {
        if (!this.selectedEvent) return;

        if (filter > 127) {
            this.selectedEvent.timeStart.setFullYear(new Date().getFullYear);
            this.selectedEvent.timeEnd.setFullYear(new Date().getFullYear);
        } else {
            this.selectedEvent.timeStart.setFullYear(filter);
            this.selectedEvent.timeEnd.setFullYear(filter);
        }        
    }

    private setDayFilter(filter: number) {
        this.dayFilter = filter;
        for (let d of this.dayFilterArray) {
            d.selected = (filter & d.value) > 0;
        }
        this.setSelectedDayFilter(this.dayFilter);
    }

    public handleDayButton(day: any) {
        day.selected=!day.selected;
        this.dayFilter = 0;
        for (let d of this.dayFilterArray) {
            this.dayFilter += (d.selected) ? d.value : 0;
        }
        this.setSelectedDayFilter(this.dayFilter);
    }

    public handleWeekButton() {
        this.setDayFilter(31);
    }

    public handleWeekendButton() {
        this.setDayFilter(96);
    }

    public handleOnceButton() {
        this.setDayFilter(128);
    }

    public handleAddButton() {
        let ne = new TimedEvent();
        ne.id = 0;
        ne.subjectType = 'heater';
        ne.action = 'target';
        ne.subjectId = this.subject.id;
        ne.timeStart = new Date();
        if (ne.timeStart.getHours() > 20) {
            ne.timeStart.setHours(20);
        }
        if (this.dayFilter < 128) {
            ne.timeStart.setFullYear(this.dayFilter);
        }
        ne.timeEnd = new Date(ne.timeStart);
        ne.timeEnd.setHours(ne.timeStart.getHours() + 3);
        this.subjectEvents.push(ne);
        this.selectedEvent = ne;
    }

    public handleEventAction() {
        switch (this.selectedEvent.action) {
            case ('timed'):
                this.selectedEvent.action = 'target';
                break;
            case ('target'):
                this.selectedEvent.action = 'timed';
                break;
        }
    }

}
