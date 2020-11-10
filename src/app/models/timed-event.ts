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

    // public setTime(timeSecs: number) {
    //     this.time = timeSecs;
    //     this.refreshCode();
    // }

    public setDays(days: number): void {
        this.days = days;
        this.refreshCode();
    }

    public setTime(time: number): void {
        this.time = time;
        this.refreshCode();
    }

    public shiftTime(timeSecs: number): void {
        if (timeSecs >= this.time + this.duration) {
            this.time = this.time + this.duration;
            this.duration = 0;
        } else {
            this.time = timeSecs;
            this.duration = this.duration + this.time - timeSecs;
        }
        this.refreshCode();
    }

    public shiftDuration(timeSecs: number): void {
        if (timeSecs <= this.time) {
            this.duration = 0;
        } else {
            this.duration = timeSecs - this.time;
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
    periodObj: TimedEventPeriod;
    action: string;

    // public setTime(timeSecs: number) {
    //     this.periodObj.setTime(timeSecs);
    //     this.period = this.periodObj.code;
    // }

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

    public setTime(time: number): void {
        this.periodObj.setTime(time);
        this.period = this.periodObj.code;
    }

    public shiftTime(timeSecs: number): void {
        this.periodObj.shiftTime(timeSecs);
        this.period = this.periodObj.code;
    }

    public shiftDuration(timeSecs: number): void {
        this.periodObj.shiftDuration(timeSecs);
        this.period = this.periodObj.code;
    }
}
