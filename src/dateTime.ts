export class DateTime{
    private d: Date;
    public isUTC: boolean = false;
    constructor() {
    }

    /**Returns the result, doesnt apply it to itself */
    public AddMilliseconds(ms:number):DateTime{
        let da = new Date(this.d.getTime() + ms);
        let dt = new DateTime(); dt.d = da;
        return dt;
    }
    /**Returns the result, doesnt apply it to itself */
    public AddSeconds(seconds:number):DateTime{
        let da = new Date(this.d.getTime() + seconds*1000);
        let dt = new DateTime(); dt.d = da;
        return dt;
    }
    /**Returns the result, doesnt apply it to itself */
    public AddMinutes(minutes:number):DateTime{
        return this.AddSeconds(minutes*60);
    }
     /**Returns the result, doesnt apply it to itself */
    public AddHours(hours:number):DateTime{
        return this.AddSeconds(hours*60*60);
    }
    public AddDays(days:number):DateTime{
        return this.AddSeconds(days*60*60*24);
    }
    public AddMonths(months:number):DateTime{
        this.d.setMonth(this.d.getMonth() + months);
        let dt = new DateTime(); dt.d = this.d;
        return dt;
    }
    public get Second(){
        console.log("second: " + this.d.getSeconds())
        return this.d.getSeconds();
    }
    public get Minute(){
        return this.d.getMinutes();
    }
    public get Hour(){
        return this.d.getHours();
    }
    /**Returns day of month, from 1 to 31(or higher). (0 is always an invalid date)*/
    public get Date(){
        return this.d.getDate();
    }
    /**Returns index of month, from 0 to 11. (January is 0)*/
    public get Month(){
        return this.d.getMonth();
    }
    /**Returns year, from 1 and up. Can go negative if you wanna do BC years.*/
    public get Year(){
        return this.d.getFullYear();
    }
    public get LocalHours():number{return this.d.getHours();}
    public get LocalMinutes():number{return this.d.getMinutes();}
    public get LocalSeconds():number{return this.d.getSeconds();}
    public get LocalMiliseconds():number{return this.d.getMilliseconds();}
    public get TimezoneOffset():number{ return this.d.getTimezoneOffset(); }
    /**Returns total ms passed since 1970*/
    public get TotalMilliseconds(){
        return this.d.valueOf();
    }
    public ToUniversalTime() : DateTime{
        const dt = new DateTime();
        dt.d = new Date(Date.UTC(this.d.getFullYear(), this.d.getMonth(), this.d.getDate(),
        this.d.getHours(), this.d.getMinutes(), this.d.getSeconds(), this.d.getMilliseconds()));
        dt.isUTC = true;
        return dt;
    }

    public static Now():DateTime{
        const dt = new DateTime();
        dt.d = new Date(Date.now()); return dt;
    }
    public static NowUTC():DateTime{
        const dt = new DateTime();
        var now = new Date(Date.now());
        dt.d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(),
        now.getMinutes(), now.getSeconds(), now.getMilliseconds()));
        dt.isUTC = true;
        return dt;
    }
    public static Convert(d: Date){
        const dt = new DateTime();
        dt.d = d;
        return dt;
    }
    public static MinValue():DateTime{
        const dt = new DateTime();
        dt.d = new Date(0); return dt;
    }
    public static MaxValue():DateTime{
        const dt = new DateTime();
        dt.d = new Date(Number.MAX_VALUE); return dt;
    }

    public static SecondsBetween(from:DateTime, to:DateTime, absolute:boolean = false){
        let diff = (from.TotalMilliseconds - to.TotalMilliseconds) / 1000;
        return absolute? Math.abs(diff) : (diff);
    }
    public static MinutesBetween(from:DateTime, to:DateTime, absolute:boolean = false){
        let diff = (from.TotalMilliseconds - to.TotalMilliseconds) / 1000 / 60;
        return absolute? Math.abs(diff) : (diff);
    }
    public static HoursBetween(from:DateTime, to:DateTime, absolute:boolean = false){
        let diff = (from.TotalMilliseconds - to.TotalMilliseconds) / 1000 / 60 / 60;
        return absolute? Math.abs(diff) : (diff);
    }

    public IsAfter(other:DateTime){
        return DateTime.SecondsBetween(this, other, false) > 0;
    }

    public toString(){
        return this.d.getHours() + ":" + this.d.getMinutes() + ":" + this.d.getSeconds();
    }
    public toString24hr(){
        let h = this.d.getHours().toString();
        if(h.length<2){h = "0"+h;}
        let m = this.d.getMinutes().toString();
        if(m.length<2){m = "0" + m;}
        return h + ":" + m;
    }
    public toStringYYYYMMDD() {
        var mm:number = this.Month + 1; // getMonth() is zero-based
        var dd:number = this.Date;
      
        return [this.Year,
                (mm>9 ? '' : '0') + mm,
                (dd>9 ? '' : '0') + dd
               ].join('');
    };
    public toStringDateSpoken() {
        var mm:number = this.Month + 1; // getMonth() is zero-based
        var dd:number = this.Date;
      
        return this.WeekdayString() + " the " + dd + " of " + mm;
    };
    public toStringDateTimeSpoken() {
        var mm:number = this.Month + 1; // getMonth() is zero-based
        var dd:number = this.Date;
      
        return this.WeekdayString() + " the " + dd + " of " + mm + ", at " + this.Hour + ":" + this.Minute;
    };
    public toStringYYYYMMDDHHMMSS() {
    var mm:number = this.d.getMonth() + 1; // getMonth() is zero-based
    var dd:number = this.d.getDate();
    var hh:number = this.d.getHours();
    var mi:number = this.d.getMinutes();
    var ss:number = this.d.getSeconds();
    //var ms:number = this.d.getMilliseconds(); 
    
    return [this.Year,
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd,
            (hh>9 ? '' : '0') + hh,
            (mi>9 ? '' : '0') + mi,
            (ss>9 ? '' : '0') + ss//,
            //(ms>9 ? '' : '0') + ms
            ].join('');
    };
    public toStringMicrosoftYYYYMMDDHHMMSS() {
        return this.d.toISOString();
    var mm:number = this.d.getMonth() + 1; // getMonth() is zero-based
    var dd:number = this.d.getDate();
    var hh:number = this.d.getHours();
    var mi:number = this.d.getMinutes();
    var ss:number = this.d.getSeconds();
    //var ms:number = this.d.getMilliseconds(); 
    
    return [this.d.getFullYear(), '-',
            (mm>9 ? '' : '0') + mm, '-',
            (dd>9 ? '' : '0') + dd, 'T',
            (hh>9 ? '' : '0') + hh, ':',
            (mi>9 ? '' : '0') + mi, ':',
            (ss>9 ? '' : '0') + ss//,
            //(ms>9 ? '' : '0') + ms
            ].join('');
    };

    public static LoadMSDate(iso8601:string): DateTime{
        const dt = new DateTime();
        dt.d = new Date(iso8601);
        return dt;
    }
    public static SortWeekdays(days:string[]):string[]{
        var l:string[] = [];
        for(let i = 0; i < this.weekdayNames.length; ++i){ //Go through all possible weekdays in order
            let x = days.indexOf(this.weekdayNames[i]); //See if days contains the weekday
            if(x>=0){l.push(this.weekdayNames[i]);} //If so, add the weekday
        }
        return l; //Return sorted weekdays
    }

    private static weekdayNames :string[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    public Weekday():number{
        //Why in all the nine hells of Avernus did the makers of javascript think day 0 should be sunday!? WHYYYYYYY
        //Answer: Apparenly USA decided to be a snowflake again and decided that SUNDAY is the FIRST day of the week!? Why? "BECAUSE MUH BIBLE SAYS SO"
        //return this.d.getDay();
        let correct = this.d.getDay()-1;
        if(correct<0){correct=6;}
        return correct;
    }
    public WeekdayString():string{return DateTime.weekdayNames[this.Weekday()];}
    public static WeekdayIndex(weekday:string):number{return this.weekdayNames.indexOf(weekday.toLowerCase());}
    public JumpToWeekdayString(weekday:string, numWeeks:number):DateTime{
        return this.JumpToWeekday(DateTime.WeekdayIndex(weekday), numWeeks);
    }
    public JumpToWeekday(weekday:number, numWeeks:number):DateTime{
        let cur = this.Weekday();
        let diff = weekday-cur; //Difference in days
        if(numWeeks<1&&numWeeks>-1){
            //Jump to a day this week. Might be forward in time, or back in time
            return this.AddDays(diff);
        }
        //Jump (interval weeks) ahead or backwards in time
        return this.AddDays((7 * numWeeks) + diff);
    }
    public StartOfWeek(clearLocalTime:boolean):DateTime{
        let diff = -this.Weekday();
        var t = this.AddDays(diff);
        if(!clearLocalTime){return t;}
        //Remove hh, mm, ss, ms
        t = t.AddMilliseconds(-t.LocalMiliseconds);
        t = t.AddSeconds(-t.LocalSeconds);
        t = t.AddMinutes(-t.LocalMinutes);
        t = t.AddHours(-t.LocalHours);
        return t;
    }
    public ToDateComparable():number{ return Number.parseInt(this.Year.toString() + this.Month.toString() + this.Date.toString());}
    public static IsValidDate(assumedYear:number, assumedMonth:number, assumedDate:number) : boolean{
        //Make sure month is in range
        while(assumedMonth<0){
            assumedMonth+= 12;
            assumedYear--;
        }
        //Check if the day is invalid, like the 31st of february
        var d = new Date(assumedYear, assumedMonth, assumedDate);
        if (d.getFullYear() == assumedYear && d.getMonth() == assumedMonth && d.getDate() == assumedDate) {
            return true;
        }
        return false;
    }
}