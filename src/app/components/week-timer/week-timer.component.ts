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

    public dayFilterArray: any[];
    public dayNewEventArray: any[];
    public dayFilter = 255;
    public repeating: boolean;
    
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

    // private getEventSet(subjectId: number, isGroup: boolean, eventSet: TimedEvent[], dayList: number[]) {
    //     let self = this;
    //     this.heatingService.getSubjectEvents(subjectId, isGroup)
    //         .subscribe(
    //             (events: TimedEvent[]) => {
    //                 eventSet = events;
    //                 // eventSet.push.apply(eventSet, events);
                    
    //                 // dayList.push.apply(dayList, this.setOneDayList(eventSet));
    //             },
    //             (err: any) => {
    //                 LoggerService.log(err);
    //             });
    // };

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
        // this.getEventSet(this.subject.id, false, this.subjectEvents, this.subjectDayList);

        let self = this;
        this.heatingService.getSubjectEvents(this.subject.id, false)
            .subscribe(
                (events: TimedEvent[]) => {
                    self.subjectEvents = events;
                    // eventSet.push.apply(eventSet, events);
                    
                    // dayList.push.apply(dayList, this.setOneDayList(eventSet));
                },
                (err: any) => {
                    LoggerService.log(err);
                });        

        // this.repeating = this.dayFilter > 0 && this.dayFilter < 1000;
        /* tslint:disable:no-bitwise */
        this.dayFilter = 255;

        this.dayFilterArray = [
            {name: 'Mon', selected: this.dayFilter & 1, value: 1},
            {name: 'Tue', selected: this.dayFilter & 2, value: 2},
            {name: 'Wed', selected: this.dayFilter & 4, value: 4},
            {name: 'Thu', selected: this.dayFilter & 8, value: 8},
            {name: 'Fri', selected: this.dayFilter & 16, value: 16},
            {name: 'Sat', selected: this.dayFilter & 32, value: 32},
            {name: 'Sun', selected: this.dayFilter & 64, value: 64}
        ];

        // ,
        // {name: 'Once', selected: this.dayFilter & 128, value: 128}

        // this.dayNewEventArray = [
        //     {name: 'Mon', selected: this.dayNew & 1},
        //     {name: 'Tue', selected: this.dayNew & 2},
        //     {name: 'Wed', selected: this.dayNew & 4},
        //     {name: 'Thu', selected: this.dayNew & 8},
        //     {name: 'Fri', selected: this.dayNew & 16},
        //     {name: 'Sat', selected: this.dayNew & 32},
        //     {name: 'Sun', selected: this.dayNew & 64},
        //     {name: 'Once', selected: this.dayNew & 128}
        // ];


        
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

        this.setDayFilter(this.selectedEvent.timeStart.getFullYear() < 1000 ? this.selectedEvent.timeStart.getFullYear() : 128)
    }

    private setDayFilter(filter: number) {
        this.dayFilter = filter;
        for (let d of this.dayFilterArray) {
            d.selected = (filter & d.value) > 0;
        }
        
    }

    public handleDayButton(day: any) {
        day.selected=!day.selected;
        this.dayFilter = 0;
        for (let d of this.dayFilterArray) {
            this.dayFilter += (d.selected) ? d.value : 0;
        }
    }

    public handleWeekButton() {
        this.dayFilter = 31;
        for (let d of this.dayFilterArray) {
            d.selected = d.value < 32;
        }
    }

    public handleWeekendButton() {
        this.dayFilter = 96;
        for (let d of this.dayFilterArray) {
            d.selected = d.value > 31;
        }
    }

    public handleOnceButton() {
        this.dayFilter = 128;
        for (let d of this.dayFilterArray) {
            d.selected = false;
        }
    }



}
