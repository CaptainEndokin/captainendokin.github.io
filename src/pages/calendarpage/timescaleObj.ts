import { DateTime } from "../../dateTime";
import { Meeting } from "../../data/meeting";
import { TimeHelper } from "../../timeHelper";
import { MeetingBlockProgressBar } from "./meetingBlockProgressBar";

export class TimescaleObj
{
    public StartTimeLocal: DateTime;
    public InsideScope:boolean;
    public HasExpired:boolean;
    public LastStartTimePerc: number = 0;
    constructor(){}

    public static BaseCalcWidthPercs(scopeLengthMinutes:number, startTimeLocal:DateTime, endTimeLocal:DateTime, scopeEndLocal:DateTime) : number[]
    {
        //How many minutes before the visible scope end does our meeting start?
        let startsMinBeforeScopeEnd = DateTime.MinutesBetween(startTimeLocal, scopeEndLocal, true);
        //A percentage for where in our scope the meeting starts. 0 = start of visible scope, 1 = end of visible scope. Can be negative aswell.
        let startPerc = 1 - (startsMinBeforeScopeEnd / scopeLengthMinutes);
        //Lets actually clamp the startperc to within the visible scope, else the graphical object will extend out overbounds
        if(startPerc<0){startPerc=0;}if(startPerc>1){startPerc=1;}
        let durationMinutes = DateTime.MinutesBetween(startTimeLocal, endTimeLocal, true); //Meeting duration in minutes
        //If the scope start is after the meeting start time, rescale the duration of the block to fit between scope start and endtime
        let scopeStart = scopeEndLocal.AddMinutes(-scopeLengthMinutes);
        if(scopeStart.IsAfter(startTimeLocal)){durationMinutes = DateTime.MinutesBetween(scopeStart, endTimeLocal, true);}
        let durationScopePerc = durationMinutes / scopeLengthMinutes; //Block length as a percentage, 1 = full length of visible scope

        let lastStartTimePerc = startPerc; //Explains where does the block starts in relation to the visible scope
        let lastWidthPerc = durationScopePerc; //Explains how wide the block is in relation to the visible scope
        let lastElapsedTimePerc = Math.min(startPerc, 0); //Is this nessesary?
        let lastWidthRemainingPerc = lastWidthPerc - Math.abs(lastElapsedTimePerc); //Is this nessesary?

        return [lastStartTimePerc, lastWidthPerc, lastElapsedTimePerc, lastWidthRemainingPerc];
    }
}

export class MeetingBlockData extends TimescaleObj
{
    public EndTimeLocal: DateTime;
    //public int DurationMinutes { get; private set; }
    //public bool HasBegun { get; private set; }
    public Title: string;
    public Meeting: Meeting;

    constructor(m: Meeting)
    {
        super();
        this.StartTimeLocal = m.timeStart_local;
        this.EndTimeLocal = m.timeEnd_local;
        this.Title = m.MeetingName;
        this.Meeting = m;
        //Color = new Color32(255, 0, 0, 255);//m.GetColor();
    }

    public UpdateScope(nowLocal: DateTime, endLocal: DateTime)
    {
        const logIfExpired: boolean = true;
        if(nowLocal==endLocal){console.error("scope starts and ends at the same time! This is probably not what you intended!");}
        this.HasExpired = TimeHelper.IsBefore(this.EndTimeLocal, nowLocal);
        this.InsideScope = !this.HasExpired && TimeHelper.IsBefore(this.StartTimeLocal, endLocal);
        if (!this.InsideScope) {
            if(logIfExpired){
            let s = "Meeting " + this.StartTimeLocal.toStringYYYYMMDDHHMMSS() + " - " + this.EndTimeLocal.toStringYYYYMMDDHHMMSS();

            console.error(s + " went out of scope. has expired: " +
        this.HasExpired + ", block starttime: " + this.StartTimeLocal +
        ", curtime: " + nowLocal + 
        ", block endtime: " + this.EndTimeLocal + 
        ",  curendtime: " + endLocal + ", curTime: " + nowLocal.toStringYYYYMMDDHHMMSS());}
        return; }
    }


    public LastElapsedTimePerc;
    public LastWidthPerc;
    public LastWidthRemainingPerc;

    public CalcWidthPercs(scopeLengthMinutes:number, scopeEndLocal:DateTime)
    {
        let numbers = TimeMarkData.BaseCalcWidthPercs(scopeLengthMinutes, this.StartTimeLocal, this.EndTimeLocal, scopeEndLocal);
        this.LastStartTimePerc = numbers[0]; //Explains where does the block starts in relation to the visible scope
        this.LastWidthPerc = numbers[1]; //Explains how wide the block is in relation to the visible scope
        this.LastElapsedTimePerc = numbers[2]; //Is this nessesary?
        this.LastWidthRemainingPerc = numbers[3]; //Is this nessesary?
    }

    public RowIndex = 0;
    /// <summary>
    /// How many rows does the stack have?
    /// </summary>
    public RowCountInStack = 0;

    public GetStatusString() : string{
        let s = "";
        s += "<span>Status: </span>";
        let col = MeetingBlockData.Color_ShowAs(this.Meeting.showAs);
        let x = "<span style='color: "+col+"'>"+MeetingBlockData.translate_showAs(this.Meeting.showAs, "se")+"</span>";
        s += x;
        return s;
    }
    private static translate_showAs(showAs:string, lang:string){
        showAs = showAs.toLowerCase();
        if(lang=="se"){
            if(showAs == "busy"){return "upptagen"};
            if(showAs == "tentative"){return "preliminärt";}
            if(showAs == "workingelsewhere"){return "arbetar på annan plats"};
            if(showAs == "free"){return "tillgänglig"};
            if(showAs == "oof"){return "inte vid datorn";}
            if(showAs=="unknown"){return "okänt"};
        }
        return showAs;
    }
    private static col_busy = "rgb(217, 28, 28)";
    private static col_free = "rgb(79, 177 51)";
    private static col_oof = "rgb(221, 104, 0)";
    private static col_workingElsewhere = "rgb(221, 104, 0)";
    private static col_unknown = "rgb(155, 155, 155)";
    private static col_tentative = "rgb(173, 202, 228)";
    public static Color_ShowAs(showAs:string){
        showAs = showAs.toLowerCase();
        if(showAs == "free"){ return MeetingBlockData.col_free;}
        if(showAs == "oof"){return MeetingBlockData.col_oof;}
        if(showAs == "workingElsewhere"){return MeetingBlockData.col_workingElsewhere;}
        if(showAs == "unknown"){return MeetingBlockData.col_unknown;}
        if(showAs == "tentative"){return MeetingBlockData.col_tentative;}
        return MeetingBlockData.col_busy;
    }
}

export class TimeMarkData extends TimescaleObj
{
    public get TimeToDisplay():DateTime { return this.StartTimeLocal; }
    public Hour = 0;
    constructor(hour: DateTime)
    {
        super();
        this.StartTimeLocal = hour;
        //this.Hour = hour.Hour;
    }
    public UpdateScope(nowLocal:DateTime, endLocal:DateTime)
    {
        this.HasExpired = TimeHelper.IsBefore(this.TimeToDisplay, nowLocal);
        this.InsideScope = !this.HasExpired && TimeHelper.IsBefore(this.TimeToDisplay, endLocal);
        if (!this.InsideScope) { return; }
    }

    public CalcPosition(scopeLengthMinutes:number, scopeEndLocal: DateTime)
    {
        let numbers = TimescaleObj.BaseCalcWidthPercs(scopeLengthMinutes, this.TimeToDisplay, scopeEndLocal, scopeEndLocal);
        //let startsMinBeforeEnd = DateTime.MinutesBetween(this.TimeToDisplay, scopeEndLocal);
        //let startPerc = 1 - (Math.abs(startsMinBeforeEnd) / scopeLengthMinutes);
        let startPerc = numbers[0];

        this.LastStartTimePerc = startPerc;
    }
}