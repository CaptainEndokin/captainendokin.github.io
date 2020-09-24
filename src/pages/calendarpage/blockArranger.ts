import { MeetingBlock } from "./meetingBlock";
import { Meeting } from "../../data/meeting";
import { TimeHelper } from "../../timeHelper";
import { DateTime } from "../../dateTime";

export class BlockArranger{

    private static readonly autoSortMeetings = true;
    public nextStackIndex:number = 1;
    public nextRowIndex:number = 1;

    public rows: BlockRow[] = [];

    constructor(){}

    public CalculateRows(meetings: Meeting[])
    {
        
        if (BlockArranger.autoSortMeetings) { meetings = Meeting.SortByStartTime(meetings); } //Should sort by latest endtime?
        //Meetings need to be sorted by start time at input!!!
        
        console.log("calculating rows for " + meetings.length + " meetings");
        for (let i = 0; i < meetings.length; ++i)
        {
            var m = meetings[i];
            if (this.rows.length == 0) { this.CreateRow(m); } //If no row yet exists, create one from this meeting
            else
            {
                //Check if it fits into any row
                var rowWithSpace = this.FindOverlappingRow(m); //Look for a row we can fit into
                if (rowWithSpace == null) { this.CreateRow(m); } //If none found, create our own
                else
                {
                    rowWithSpace.AddMeeting(m); //Might create a new row inside the stack
                }
            }
        }
    }

    private CreateRow(m:Meeting)
    {
        const row = new BlockRow(this);
        row.AddMeeting(m);
        this.rows.push(row);
    }


    private FindOverlappingRow(m: Meeting) : BlockRow | undefined
    {
        for (var row of this.rows) { if (!BlockArranger.OverlapsWith2(m, row)) { return row; } }
        return undefined;
    }
    public static OverlapsWith2(m: Meeting, row: BlockRow) : boolean
    {
        //Ask each meeting in row if meeting m overlaps with them
        for (let m2 of row.Meetings) { if (this.OverlapsWith(m, m2)) { return true; } }
        return false;
    }
    public static OverlapsWith(a: Meeting, b: Meeting) : boolean
    {
        var aStart = a.timeStart_local;
        var aEnd = a.timeEnd_local;
        var bStart = b.timeStart_local;
        var bEnd = b.timeEnd_local;

        //Needs to be tested, but should work
        //If we end before they start, false
        if (TimeHelper.IsBefore(aEnd, bStart)) { return false; }
        //If we start after they end, false
        if (TimeHelper.IsBefore(bEnd, aStart)) { return false; }
        //If we end just as they start, false
        if(TimeHelper.IsSameMinute(aEnd, bStart)){return false;}
        //If we start just as they end, false
        if(TimeHelper.IsSameMinute(bEnd, aStart)){return false;}
        //Else, we must be overlapping
        return true;
    }
}


export class BlockRow
{
    public RowIndex:number = 0;
    public Meetings: Meeting[];

    constructor(arranger:BlockArranger)
    {
        this.RowIndex = arranger.nextRowIndex; arranger.nextRowIndex++;
        this.Meetings = [];
    }
    public AddMeeting(meeting:Meeting){
        this.Meetings.push(meeting);
    }

    public get RowStartTime():DateTime
    {
        if (this.Meetings.length < 1) { return TimeHelper.CurTime; }
        var ms = Meeting.SortByStartTime(this.Meetings); //Should sort by latest endtime?
        return ms[0].timeStart_local;
    }
    public get RowEndTime():DateTime
    {
        if (this.Meetings.length < 1) { return TimeHelper.CurTime; }
        var ms = Meeting.SortByEndTime(this.Meetings); //Should sort by latest endtime?
        return ms[ms.length - 1].timeEnd_local;
    }
}