import { Component, Input, Output, EventEmitter, ElementRef, OnInit, OnChanges } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { HeatingService } from '../../services/heating.service';
import { TimedEvent } from '../../models/timed-event';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-day-timer',
  templateUrl: './day-timer.component.html',
  styleUrls: ['./day-timer.component.scss']
})
export class DayTimerComponent implements OnInit {
    @Input() events: TimedEvent[];
    @Input() editable: boolean;
    @Input() dayFilter: number;
    @Input() selectedEvent: TimedEvent;
    @Output() onEventSelected = new EventEmitter<TimedEvent>();

    public dragPeriod: any = null;
    public dayStart: Date;
    public dayEnd: Date;

    public hours: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0 ];
    public ctrlWidth = 320;
    public barWidth = 320;
    public barLeft = 10;

    public filteredEvents: TimedEvent[];
    // public selectedPeriod: any = null;
    public dayArray: any[];
    public repeating: boolean;
    public showCommit: boolean = false;
    public dayLabel: string = '';

    public selectedPeriod: TimedEvent;

    constructor(
        private elementRef: ElementRef,
        private heatingService: HeatingService,
        private datePipe: DatePipe
    ) {}

    private init() {
        this.handleResize(null);
console.log('filtering ' + this.events.length + ' events, with filter: ' + this.dayFilter)
        this.filteredEvents = this.events.filter(e => (e.timeStart.getFullYear() < 1000 && (e.timeStart.getFullYear() & this.dayFilter) > 0) 
            || (this.dayFilter > 127 && e.timeStart.getFullYear() > 1000));
      
        this.repeating = this.dayFilter > 0 && this.dayFilter < 1000;
        /* tslint:disable:no-bitwise */
        this.dayArray = [{name: 'Mon', selected: this.dayFilter & 1},
                                {name: 'Tue', selected: this.repeating && this.dayFilter & 2},
                                {name: 'Wed', selected: this.repeating && this.dayFilter & 4},
                                {name: 'Thu', selected: this.repeating && this.dayFilter & 8},
                                {name: 'Fri', selected: this.repeating && this.dayFilter & 16},
                                {name: 'Sat', selected: this.repeating && this.dayFilter & 32},
                                {name: 'Sun', selected: this.repeating && this.dayFilter & 64}];
        /* tslint:enable:no-bitwise */

        switch (this.dayFilter) {
            case 31:
                this.dayLabel = 'week days';
                break;
            case 96:
                this.dayLabel = 'weekend';
                break;
            case 127:
                this.dayLabel = 'all week';
                break;
            default:
                ///if ()
                this.dayLabel = '';
                if (this.dayFilter < 1000) {
                    for (let i = 0; i < 7; i++) {
                        if (this.dayArray[i].selected) {
                            this.dayLabel += (this.dayLabel !== '') ? ', ' + this.dayArray[i].name : this.dayArray[i].name;
                        }
                    }
                } else {
                    this.dayLabel = 'one time';
                }
        }
    };

    ngOnInit() {
      // LoggerService.log('DayTimer');
    }

    ngOnChanges(changes) {
        LoggerService.log('DayTimer');
        this.init();
    }

  public handleResize($event = null, repeat = true) {
      this.ctrlWidth = this.elementRef.nativeElement.getBoundingClientRect().width;
      this.barWidth = this.ctrlWidth - 20;
      this.barLeft = 10;
      if (repeat) {
        let self = this;
        setTimeout(function() {
          self.handleResize(null, false)
        }, 50);
      }
    }
    
    public setDragPeriod(period: any) {
        this.dragPeriod = {};
        this.dragPeriod.timeStart = new Date(period.timeStart);
        this.dragPeriod.timeEnd = new Date(period.timeEnd);

        this.dayStart = new Date(period.timeStart);
        this.dayStart.setHours(0, 0, 0, 0);
        this.dayEnd = new Date(this.dayStart);
        this.dayEnd.setHours(23, 59, 59, 999);
    };

    public convertPixelToMilliseconds(value: number) {
        return value * 3600000 / ((this.ctrlWidth - 20) / 24);
    };

    public isValidPeriod(timedEvent: TimedEvent) {
        if (!timedEvent || !timedEvent.timeStart || !this.filteredEvents.find(e => e === timedEvent)) { return false; }
        // let start: Date = new Date(period.timeStart);
        return true;
    };

    public getPeriodStartX(period: any) {
        let start: Date = new Date(period.timeStart);
        return (this.ctrlWidth - 20) / 24 * (start.getHours() + start.getMinutes() / 60) + 10;
    };

    public getPeriodEndX(period: any) {
        let end: Date = new Date(period.timeEnd);
        return (this.ctrlWidth - 20) / 24 * (end.getHours() + end.getMinutes() / 60) + 10;
    };

    public getPeriodWidth(period: any) {
        let start: Date = new Date(period.timeStart);
        let end: Date = new Date(period.timeEnd);
        let p: number = end.getTime() - start.getTime();
        return (p / 3600000) * (this.ctrlWidth - 20) / 24;
    };

    public onTapPeriod($event: any, period: any) {
      LoggerService.log('onTapPeriod');
        if (this.selectedPeriod === period) {
            this.selectedPeriod = null;
            this.onEventSelected.emit(this.selectedPeriod);
            this.commitPeriodUpdate(period);
        } else {
            this.selectedPeriod = period;
            this.onEventSelected.emit(this.selectedPeriod);
        }
    };

    private periodDeleteIfEmpty(period: any) {
        let self = this;
        let testStart = new Date(period.timeStart);
        let testEnd = new Date(period.timeEnd);
        if (testStart.getTime() === testEnd.getTime()) {
            if (period.id > 0) {
                self.heatingService.deleteEvent(period)
                    .subscribe( (res: any) => {
                        period = {};
                        self.selectedPeriod = null;
                    });
            } else {
                period = {};
                this.selectedPeriod = null;
            }
            LoggerService.log('DayTimer.periodDeleteIfEmpty period deleted');
            this.onEventSelected.emit(null);
            return true;
        }
        return false;
    };

    public onDragPeriod($event: any, period: any) {
        $event.preventDefault();        
        switch ($event.type) {
            case 'panstart':
                this.setDragPeriod(period);
                break;
            case 'pan':
                period.timeStart = new Date(); period.timeStart.setTime(this.dragPeriod.timeStart.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                period.timeEnd = new Date(); period.timeEnd.setTime(this.dragPeriod.timeEnd.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                break;
            case 'panend':
                this.dragPeriod = null;
                break;
        }
    };

    public onDragTimeStart($event: any, period: any) {
        $event.preventDefault();        
        switch ($event.type) {
            case 'panstart':
                this.setDragPeriod(period);
                break;
            case 'pan':
                period.timeStart = new Date(); period.timeStart.setTime(this.dragPeriod.timeStart.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                if (period.timeStart.getTime() > this.dragPeriod.timeEnd.getTime()) { period.timeStart.setTime(this.dragPeriod.timeEnd.getTime()); }
                if (period.timeStart.getTime() < this.dayStart.getTime()) { period.timeStart.setTime(this.dayStart.getTime()); }
                break;
            case 'panend':
                this.dragPeriod = null;
                if (this.periodDeleteIfEmpty(period)) { this.init(); }
                break;
        }
    };

    public onDragTimeEnd($event: any, period: any) {
        $event.preventDefault();        
        switch ($event.type) {
            case 'panstart':
                this.setDragPeriod(period);
                break;
            case 'pan':
                period.timeEnd = new Date(); period.timeEnd.setTime(this.dragPeriod.timeEnd.getTime() + this.convertPixelToMilliseconds($event.deltaX));
                if (period.timeEnd.getTime() < this.dragPeriod.timeStart.getTime()) { period.timeEnd.setTime(this.dragPeriod.timeStart.getTime()); }
                if (period.timeEnd.getTime() > this.dayEnd.getTime()) { period.timeEnd.setTime(this.dayEnd.getTime()); }
                break;
            case 'panend':
                this.dragPeriod = null;
                if (this.periodDeleteIfEmpty(period)) { this.init(); }
                break;
        }
    };

    public commitPeriodUpdate(period: any) {
        let self = this;
        let formatted: string;
        formatted = this.datePipe.transform(period.timeStart, 'yyyyMMdd HH:mm:ss');
        if (formatted.indexOf(' ') === 6) { formatted = '00' + formatted; } period.timeStartStr = formatted;
        formatted = this.datePipe.transform(period.timeEnd, 'yyyyMMdd HH:mm:ss');
        if (formatted.indexOf(' ') === 6) { formatted = '00' + formatted; } period.timeEndStr = formatted;
        this.heatingService.saveEvent(period)
            .subscribe( (res: any) => {
                period.id = res.id;
            });
    };
    
}
