export class TimedEventPeriod {
    code: string;
    days: number;
    absoluteDate: Date;
    time: number;
    duration: number;

    constructor(code: string) {
        this.code = code;
        
        let codeSplit = code.split('-');
        if (codeSplit.length != 3) { return; }

        let days = parseInt(codeSplit[0]);

        if (days > 127) {
            this.absoluteDate = new Date(codeSplit[0])
        } else {
            this.days = days;
        }

        this.time = parseInt(codeSplit[1]);
        this.duration = parseInt(codeSplit[2]);
    }

    private formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [year, month, day].join('-');
    }

    private refreshCode() {
        this.code = `${(this.absoluteDate ? this.formatDate(this.absoluteDate) : this.days)}-${this.time}-${this.duration}`;
    }

    public setDays(days: number): void {
        this.days = days;
        this.refreshCode();
    }

    public setDuration(durationSecs: number): void {
        durationSecs = Math.round(durationSecs);
        if (durationSecs < 0) { durationSecs = 0; }
        if (this.time + durationSecs > 86400) { durationSecs = 86400 - this.time; }
        this.duration = durationSecs;
        this.refreshCode();
    }

    public setTime(timeSecs: number): void {
        timeSecs = Math.round(timeSecs);
        if (timeSecs < 0) { timeSecs = 0; }
        this.time = timeSecs;
        this.refreshCode();
    }

    public shiftTime(timeSecs: number): void {
        timeSecs = Math.round(timeSecs);
        if (timeSecs < 0) { timeSecs = 0; }
        if (timeSecs >= this.time + this.duration) {
            this.time = this.time + this.duration;
            this.duration = 0;
        } else {
            this.duration = this.duration + this.time - timeSecs;
            this.time = timeSecs;
        }
        this.refreshCode();
    }
}

export class TimedEvent {
    description: string;
    id: number;
    isGroup: boolean;
    subjectId: number;
    subjectType: string;
    period: string;
    periodObj: TimedEventPeriod = new TimedEventPeriod('');
    action: string;

    public static mapMany(sourceList: TimedEvent[]): TimedEvent[] {
        const retList: TimedEvent[] = [];
        sourceList.forEach( x => {
            retList.push(this.map(x));
        });
        return retList;
    }

    public static map(source: TimedEvent): TimedEvent {
        const newEvent = new TimedEvent;
        for (let key of Object.keys(source)) {
            newEvent[key] = source[key];
        }
        return newEvent;
    }

    public setDays(days: number): void {
        this.periodObj.setDays(days);
        this.period = this.periodObj.code;
    }

    public setDuration(duration: number): void {
        this.periodObj.setDuration(duration);
        this.period = this.periodObj.code;
    }

    public setTime(timeSecs: number): void {
        this.periodObj.setTime(timeSecs);
        this.period = this.periodObj.code;
    }

    public shiftTime(timeSecs: number): void {
        this.periodObj.shiftTime(timeSecs);
        this.period = this.periodObj.code;
    }
}
