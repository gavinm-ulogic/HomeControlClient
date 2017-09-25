import { Component, Input, ElementRef, OnInit, OnChanges } from '@angular/core';
import { LoggerService } from '../../services/logger.service';
import { HeatingService } from '../../services/heating.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-day-timer',
  templateUrl: './day-timer.component.html',
  styleUrls: ['./day-timer.component.scss']
})
export class DayTimerComponent implements OnInit {
    @Input() periods: any[];
    @Input() editable: boolean;
    @Input() newEvent: boolean;
    @Input() dayFilter: number;

    public dragPeriod: any = null;
    public dayStart: Date;
    public dayEnd: Date;

    public hours: number[] = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0 ];
    public ctrlWidth = 320;
    public barWidth = 320;
    public barLeft = 10;
    public selectedPeriod: any = null;
    public dayArray: any[];
    public repeating: boolean;
    public showCommit: boolean = false;
    public dayLabel: string = '';

    constructor(
        private elementRef: ElementRef,
        private heatingService: HeatingService,
        private datePipe: DatePipe
    ) {}

    private init() {
      // this.ctrlWidth = this.elementRef.nativeElement.offsetParent.offsetWidth;
        // this.ctrlWidth = this.elementRef.nativeElement.parentElement.clientWidth;
        // this.barWidth = this.ctrlWidth - 20;
        // this.barLeft = 10;
        this.handleResize(null);
      
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

        if (this.newEvent) {
            this.periods[0].id = 0;
            this.periods[0].timeStart = new Date();
            this.periods[0].timeStart.setHours(12, 0, 0, 0);
            this.periods[0].timeEnd = new Date();
            this.periods[0].timeEnd.setHours(14, 0, 0, 0);

            this.showCommit = true;
            this.dayLabel = 'new';
        } else {
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
        }
    };

    ngOnInit() {
      // LoggerService.log('DayTimer');
      // this.init();
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
    
    // private setDragPeriod = function(period: any) {
    public setDragPeriod = function(period: any) {
        this.dragPeriod = {};
        this.dragPeriod.timeStart = new Date(period.timeStart);
        this.dragPeriod.timeEnd = new Date(period.timeEnd);

        this.dayStart = new Date(period.timeStart);
        this.dayStart.setHours(0, 0, 0, 0);
        this.dayEnd = new Date(this.dayStart);
        this.dayEnd.setHours(23, 59, 59, 999);
    };

    // private convertPixelToMilliseconds = function(value: number) {
    public convertPixelToMilliseconds = function(value: number) {
        return value * 3600000 / ((this.ctrlWidth - 20) / 24);
    };

    public isValidPeriod(period: any) {
        if (!period || !period.timeStart) { return false; }
        let start: Date = new Date(period.timeStart);
        if (!this.newEvent && this.dayFilter && start.getFullYear() !== this.dayFilter) { return false; }
        return true;
    };

    public getPeriodStartX = function(period: any) {
        let start: Date = new Date(period.timeStart);
        return (this.ctrlWidth - 20) / 24 * (start.getHours() + start.getMinutes() / 60) + 10;
    };

    public getPeriodEndX = function(period: any) {
        let end: Date = new Date(period.timeEnd);
        return (this.ctrlWidth - 20) / 24 * (end.getHours() + end.getMinutes() / 60) + 10;
    };

    public getPeriodWidth = function(period: any) {
        let start: Date = new Date(period.timeStart);
        let end: Date = new Date(period.timeEnd);
        let p: number = end.getTime() - start.getTime();
        return (p / 3600000) * (this.ctrlWidth - 20) / 24;
    };

    public onTapPeriod = function ($event: any, period: any) {
      LoggerService.log('onTapPeriod');
        if (this.selectedPeriod === period) {
            this.selectedPeriod = null;
            if (period.id > 0) { this.commitPeriodUpdate(period); } // don't save new periods here - wait for tick press
        } else {
            this.selectedPeriod = period;
        }
    };

    private periodDeleteIfEmpty = function(period: any) {
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


                // this.heatingService.deleteEvent(period.id).then(function(){
                //     period = {};
                // });
            } else {
                period = {};
                this.selectedPeriod = null;
            }
            LoggerService.log('DayTimer.periodDeleteIfEmpty period deleted');
            return true;
        }
        return false;
    };

    public onDragPeriod = function($event: any, period: any) {
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
                if (!this.newEvent) { this.commitPeriodUpdate(period); }
                break;
        }
    };

    public onDragTimeStart = function($event: any, period: any) {
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

    public onDragTimeEnd = function($event: any, period: any) {
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

    public commitPeriodUpdate = function(period: any) {
        let self = this;
        let formatted: string;
        formatted = this.datePipe.transform(period.timeStart, 'yyyyMMdd HH:mm:ss');
        if (formatted.indexOf(' ') === 6) { formatted = '00' + formatted; } period.timeStartStr = formatted;
        formatted = this.datePipe.transform(period.timeEnd, 'yyyyMMdd HH:mm:ss');
        if (formatted.indexOf(' ') === 6) { formatted = '00' + formatted; } period.timeEndStr = formatted;
        period.type = 1;
        this.heatingService.saveEvent(period)
            .subscribe( (res: any) => {
                period.id = res.id;
            });
    };

    public addNewEvent = function() {
        LoggerService.log('DayTimer addNewEvent');
        let timeStart = new Date();
        let timeEnd = new Date();
        timeStart.setHours(12, 0, 0, 0);
        timeEnd.setHours(14, 0, 0, 0);

        for (let i = 0; i < this.periods.length; i++) {
            if (this.isValidPeriod(this.periods[i])) {
                LoggerService.log('DayTimer addNewEvent found match event');
                let matchStart = new Date(this.periods[i].timeStart);
                timeStart.setFullYear(matchStart.getFullYear());
                timeEnd.setFullYear(matchStart.getFullYear());
                this.periods.push({id: 0, subjectId: this.periods[i].subjectId, isGroup: this.periods[i].isGroup, timeStart: timeStart, timeEnd: timeEnd});
                this.showCommit = true;
                break;
            }
        }
    };

    public handleCommit = function() {
        for (let i = 0; i < this.periods.length; i++) {
            if (this.periods[i].id === 0) {
                if (this.newEvent) {
                    if (this.repeating) {
                        let year = 0;
                        for (let j = 0; j < 7; j++) {
                            year = year + (this.dayArray[j].selected ? 1 : 0) * Math.pow(2, j);
                        }
                        if (year === 0) { return; }
                        this.periods[i].timeStart.setFullYear(year, 0, 1);
                        this.periods[i].timeEnd.setFullYear(year, 0, 1);
                    } else {
                        let now = new Date();
                        this.periods[i].timeStart.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                        this.periods[i].timeEnd.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
                    }

                    let newStart: Date = new Date(this.periods[i].timeStart.getTime() - this.periods[i].timeStart.getTimezoneOffset() * 60000);
                    let newEnd: Date = new Date(this.periods[i].timeEnd.getTime() - this.periods[i].timeEnd.getTimezoneOffset() * 60000);
                    this.periods[i].timeStart = newStart;
                    this.periods[i].timeEnd = newEnd;
                }
                this.periods[i].type = 1;
                this.commitPeriodUpdate(this.periods[i]);
            }
        }
    };
}
