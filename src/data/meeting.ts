import { DateTime } from "../dateTime";
import { TimeHelper } from "../timeHelper";
import { Person } from "./person";
import { MeetingGetter } from "../networking/meetingGetter";

export class Meeting{

    timeStart_local: DateTime;
    timeEnd_local: DateTime;
    id: string;
    public IsSeriesMaster:boolean = false;
    public IsChildInstance:boolean = false;
    public MeetingName:string = "NO_NAME";
    public showAs: string; //free, tentative, busy, oof, workingelsewhere, unknown
    public person: Person;

    constructor(start:DateTime, end:DateTime){
        this.timeStart_local = start;
        this.timeEnd_local = end;
        if(TimeHelper.IsBefore(this.timeEnd_local, this.timeStart_local))
        {console.error("Created meeting that ends before it begins! ("+this.timeStart_local.toString24hr()+"-"+this.timeEnd_local.toString24hr()+")");}
    }
    public static Load(data, p:Person, isUTC:boolean) : Meeting
    {
        var start = DateTime.LoadMSDate(data.start.dateTime);
        var end = DateTime.LoadMSDate(data.end.dateTime);
        //Do the actual conversion from UTC to local time here, if desired
        if(isUTC){
            var localNow = TimeHelper.CurTime;
            start = start.AddMinutes(-localNow.TimezoneOffset);
            end = end.AddMinutes(-localNow.TimezoneOffset);
        }
        var m = new Meeting(start, end);
        m.MeetingName = data.subject;
        m.id = data.id;
        m.person = p;
        m.showAs = data.showAs;
        if(data.type == "seriesMaster") { m.IsSeriesMaster=true; }
        return m;
    }
    private GetMeetingSeries(rec, from: DateTime, to: DateTime){
        let a = [];
        if(rec==null){return null;}
        if(rec.pattern.type=="weeklyx") {
            let days:string[] = rec.pattern.daysOfWeek;
            let s = "Meeting is every";
            if(rec.pattern.interval==1){s += " week";}
            else{s += " " + rec.pattern.interval + " weeks";}
            s += " on ";
            for(let i = 0; i < days.length; ++i){
                if(i>0&&(i<days.length-1)){ s += ", ";}
                else if(i>0){s += " and ";}
                s += days[i] + "s";
            }

            console.log(s);
            Meeting.GetWeeklyTimes(rec.pattern, rec.range, this);
            let times = Meeting.GetDailyTimes(rec.pattern, rec.range, this);
            for(let i = 0; i < times.length; ++i){
                let start :DateTime = times[i][0];
                console.log(start.WeekdayString() + " the " + start.Date + "/" + start.Month);
            }
        }
        else if(rec.pattern.type=="dailyx"){
            let times = Meeting.GetDailyTimes(rec.pattern, rec.range, this);
            for(let i = 0; i < times.length; ++i){
                let start :DateTime = times[i][0];
                console.log(start.WeekdayString() + " the " + start.Date + "/" + start.Month);
            }
        }
        else if(rec.pattern.type=="absoluteMonthly"){
            let times = Meeting.GetAbsoluteMonthlyTimes(rec.pattern, rec.range, this);
        for(let i = 0; i < times.length; ++i){
            let start :DateTime = times[i][0];
            console.log(start.WeekdayString() + " the " + start.Date + "/" + start.Month);
            }
        }
    }


    public static SortByStartTime(meetings: Meeting[]): Meeting[]
    {
        return meetings.sort(function(a,b)
        {return (a.timeStart_local > b.timeStart_local) ? 1 :
            ((b.timeStart_local > a.timeStart_local) ? -1 : 0);} );
    }
    public static SortByEndTime(meetings: Meeting[]) : Meeting[]
    {
        return meetings.sort(function(a,b)
        {return (a.timeEnd_local > b.timeEnd_local) ? 1 :
        ((b.timeEnd_local > a.timeEnd_local) ? -1 : 0);} );
    }

    public HasStarted() {
        var n = TimeHelper.CurTime;
        return n.IsAfter(this.timeStart_local);
    }
    public HasEnded() {
        var n = TimeHelper.CurTime;
        return n.IsAfter(this.timeEnd_local);
    }

    private static GetDailyTimes(p, r, source:Meeting) : any[]{
        let ar = [];
        var t = source.timeStart_local;
        let durationMs = source.timeEnd_local.TotalMilliseconds - t.TotalMilliseconds;

        ar.push([source.timeStart_local, source.timeEnd_local]); //Add original event
        //What kind of range does the reccurance have?
        if(r.type == "numbered") {
            //Event repeats for the numberOfOccurrences based on the recurrence pattern beginning on the startDate.
            for(let j = 0; j < r.numberOfOccurrences; ++j) {
                t = t.AddDays(1);
                //Get start time and end time
                let x = [t, t.AddMilliseconds(durationMs)];
                ar.push(x);
            }
        }
        else if(r.type == "endDate") {
            let goal = DateTime.LoadMSDate(r.endDate);
            while(!t.IsAfter(goal)){
                //Jump to a weekday in the current week
                t = t.AddDays(1);
                ar.push([t, t.AddMilliseconds(durationMs)]);
            }
        }
        else{ //No end
            //Not sure what to do here, i guess we simply load all meetings between startdate and x amount of days in the future (relative to us), and check to see if any of the meetings fit inside our timespan
        }

        
        return ar;
    }
    private static GetWeeklyTimes(p, r, source:Meeting) : any[]{
        let ar = [];
        var t = source.timeStart_local;
        let durationMs = source.timeEnd_local.TotalMilliseconds - t.TotalMilliseconds;
        var days = DateTime.SortWeekdays(p.daysOfWeek);
        console.log(t.toStringMicrosoftYYYYMMDDHHMMSS());
        
        console.log("Master event was at " + t.toStringMicrosoftYYYYMMDDHHMMSS());
        
        //Already includes original event

        //Go through each week interval, interval may be > 1, meaning not every week may be used
        if(p.interval<1){ console.log("Meeting pattern interval was below zero, this is unexpected!"); return;}

        //What kind of range does the reccurance have?
        if(r.type == "numbered") {
            //Event repeats for the numberOfOccurrences based on the recurrence pattern beginning on the startDate.
            //The question is: what exactly is an occurence? Is it every meeting, or is it every week?
            for(let occurrences = 0; occurrences < r.numberOfOccurrences; occurrences = occurrences) {
                for(let j = 0; j < days.length && occurrences < r.numberOfOccurrences; ++j) {
                    //Jump to a weekday in the current week
                    t = t.JumpToWeekdayString(days[j], 0); //Jump to a day in this week. Keep local time
                    ar.push([t, t.AddMilliseconds(durationMs)]);
                    occurrences++; //I *think* this is what they mean by occurences, each meeting is an occurence
                }
                t = t.JumpToWeekday(0, p.interval); //Jump to monday the next week (or further, depending on interval)
            }
        }
        else if(r.type == "endDate") {
            let curDate : number = t.ToDateComparable();
            let goal: number = DateTime.LoadMSDate(r.endDate).ToDateComparable();
            while(curDate <= goal){
                for(let j = 0; j < days.length; ++j) {
                    //Jump to a weekday in the current week
                    t = t.JumpToWeekdayString(days[j], 0); //Jump to a day in this week. Keep local time
                    ar.push([t, t.AddMilliseconds(durationMs)]);
                }
                t = t.JumpToWeekday(0, p.interval); //Jump to monday the next week (or further, depending on interval)
                curDate = t.ToDateComparable();
            }
        }
        else{ //No end
            //Not sure what to do here, i guess we simply load all meetings between startdate and x amount of days in the future (relative to us), and check to see if any of the meetings fit inside our timespan
        }

        return ar;
    }
    private static GetAbsoluteMonthlyTimes(p, r, source:Meeting) : any[]{
        let ar = [];
        var t = source.timeStart_local;
        let durationMs = source.timeEnd_local.TotalMilliseconds - t.TotalMilliseconds;
        console.log(t.toStringMicrosoftYYYYMMDDHHMMSS());
        
        console.log("Master event was at " + t.toStringMicrosoftYYYYMMDDHHMMSS());
        console.log(r.type);
        let localDate = p.dayOfMonth;
        let startMonth = t.Month;

        //Go through each month interval, interval may be > 1, meaning not every month may be used
        if(p.interval<1){ console.log("Meeting pattern interval was below zero, this is unexpected!"); return;}

        //What kind of range does the reccurance have?
        if(r.type == "numbered") {
            //Event repeats for the numberOfOccurrences based on the recurrence pattern beginning on the startDate.
            //The question is: what exactly is an occurence? Is it every meeting, or is it every week?
            for(let occurrences = 0; occurrences < r.numberOfOccurrences; occurrences = occurrences) {
                //Add one month to the date. Check that the new date is valid (ie, not something like 31st of february)
                let lastMonth = t.Month;
                t = t.AddMonths(1);
                if(!DateTime.IsValidDate(t.Year, lastMonth, localDate))
                {
                    console.log(localDate + " of " + lastMonth + " does not exist!");
                }
                
            }
        }
        else if(r.type == "endDate") {
            let goal = DateTime.LoadMSDate(r.endDate);
            while(!t.IsAfter(goal)){
                //Check if the desired date exists on the next month
                let nextMonth = t.Month+1; if(nextMonth>11){nextMonth=0;}
                console.log("Next month: " + (nextMonth+1).toString()); //When printing to string, +1 the month for it to make sense to a human
                
                t = t.AddMonths(1); //If the day is invalid (like 31st of February, the DateTime will
                //just go to into the next month and find what that date shouldve been, like 2nd of March)
                //Therefore, we have to find out if the date was invalid ourselves
                //We trust T to keep track of the correct year, but we keep track of what month it should be
                //And we use the same date every time, localDate
                if(!DateTime.IsValidDate(t.Year, nextMonth, localDate))
                {
                    console.log("Invalid date: " + localDate + "/" + (nextMonth+1).toString());
                    //Here, T will think its on the 2nd of March, instead of 31st of February
                    console.log("T settled on " + t.toStringMicrosoftYYYYMMDDHHMMSS());
                    ar.push([t, t.AddMilliseconds(durationMs)]);
                }
                else{ ar.push([t, t.AddMilliseconds(durationMs)]);}
            }
        }
        else{ //No end
            //Not sure what to do here, i guess we simply load all meetings between startdate and x amount of days in the future (relative to us), and check to see if any of the meetings fit inside our timespan
        }
        return ar;
    }

    
}