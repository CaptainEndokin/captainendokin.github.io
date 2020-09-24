import { MeetingBlockData, TimeMarkData } from "./timescaleObj";
import { MeetingBlock } from "./meetingBlock";
import { Meeting } from "../../data/meeting";
import { DateTime } from "../../dateTime";
import { BlockArranger, BlockRow } from "./blockArranger";
import { TimeHelper } from "../../timeHelper";
import { TimeMark } from "./timemark";
import $ from "jquery";
import 'jquery-ui-bundle';
import { IDTask } from "../../networking/IDTask";

export class MeetingBlockProgressBar
{
    static readonly DislayMeetingNamesInBlocks = true;
    static readonly HideMeetingBlockNameIfLessWidthPercThen = 0.05; //5%
    static usingUWPBlocks = true;
    static clumpTogetherMeetingsInStack = false; //was true, it merges several meetings into a single block that encompasses them all

    //public RectTransform MeetingBlockParent;
    //public RectTransform TimeMarkParent;
    static ScopeLengthMinutes:number = 60 * 6;
    private scopeStartLocal:DateTime;
    private scopeEndLocal:DateTime;
    private curRowCount: number = 0;
    private lastMBlockParentHeight: number = 0;
    private meetings: Meeting[];
    private rows: HTMLElement[] = [];
    //public MeetingBlockProgressBar()
    //{
    //    this.InitializeComponent();
    //    BarGridParent.Height = GlobalSettings.MeetingBarHeight;
    //}

    meetingBlockDatas: MeetingBlockData[] = []; //Only stores datas
    graphicalMeetingBlocks: MeetingBlock[] = [];


    private meetingBlockParent: JQuery<HTMLElement>;
    private timeMarkParent: JQuery<HTMLElement>;
    constructor(root:JQuery<HTMLElement>){
        this.timeMarkParent = $("<div class=tmarkParent></div>").appendTo(root);
        this.meetingBlockParent = $("<div class=mblockParent></div>").appendTo(root);
        setTimeout(this.Update, 2000);
    }

    ///<summary>Refreshes the meetings displayed</summary>
    public Refresh(meetings: Meeting[])
    {
        this.ClearMeetingBlocks(); //Clear existing blocks
        this.FeedMeetings(meetings); //Create new blocks
    }

    public FeedMeetings(meetings: Meeting[], refreshUI:boolean = true)//, Person person)
    {
        this.meetings = meetings;
        if(refreshUI){this.RefreshUI();}
    }
    private ClearMeetingBlocks()
    {
        console.log("Clear meeting blocks!");
        for(var block of this.graphicalMeetingBlocks)
        {
            //GameObject.Destroy(block.gameObject);
            block.Destroy();
        }
        this.graphicalMeetingBlocks = [];
        this.meetingBlockDatas = [];
        for(let i = 0; i < this.rows.length; ++i){
            this.rows[i].remove();
        }
        this.rows = [];
    }
    public RefreshUI(){
        this.ClearMeetingBlocks();
        //console.log("MEETINGPROGRESSBAR_" + person.UserName + ":");
        let nowLocal = TimeHelper.CurTime;
        let endLocal = nowLocal.AddMinutes(MeetingBlockProgressBar.ScopeLengthMinutes);
        let meetingCount = this.meetings != null ? this.meetings.length : 0;
        
        console.log("Progress bar was fed " + meetingCount + " meetings.");
        for(let i = 0; i < meetingCount; ++i){
            console.log("Meeting #"+(i+1)+": " + this.meetings[i].timeStart_local.toStringDateTimeSpoken() + " - " + this.meetings[i].timeStart_local.toStringDateSpoken());
        }
        let arranger = new BlockArranger();
        if(this.meetings != null) { arranger.CalculateRows(this.meetings); }
        //END DEBUG

        this.CreateMissingMeetingBlockDatas2(arranger.rows);
        this.CreateMissingTimeMarkDatas(nowLocal, endLocal);


        this.UpdateScope();
        this.RefreshGraphicalBlocks();
        this.RefreshDisplayedTimeMarks();

        this.AdaptToColorScheme();
    }

    public UpdateScope()
    {
        //Gather the start and end times dor our progress bar
        let nowLocal = TimeHelper.CurTime;
        let endLocal = nowLocal.AddMinutes(MeetingBlockProgressBar.ScopeLengthMinutes);
        this.scopeStartLocal = nowLocal; this.scopeEndLocal = endLocal;

        //Inform the blocks of the new scope (start and end times)
        //Remove the blocks that consider themselves expired
        this.UpdateScopes_Blocks(nowLocal, endLocal);

        //Do the same for timelines
        this.UpdateScope_TimeMarks(nowLocal, endLocal);
    }

    private Update=()=>
    {
        this.UpdateScope();
        this.RefreshGraphicalBlocks();
        this.RefreshDisplayedTimeMarks();
        setTimeout(this.Update, 2000);
    }
    //Update the data in the meetingblockdatas
    private UpdateScopes_Blocks(nowLocal: DateTime, endLocal:DateTime)
    {
        var blocks = this.meetingBlockDatas;
        for (var b of blocks)
        {
            b.UpdateScope(nowLocal, endLocal);
            if (b.HasExpired) { 
                console.error("todo: remove block data");
                //this.meetingBlockDatas.Remove(b);
            }
        }
    }
    private RefreshGraphicalBlocks()
    {
        //Fix
        let showNoMeetingsText = true;
        for (var block of this.graphicalMeetingBlocks)
        {
            showNoMeetingsText = false;
            console.log("todo: refresh block position");
            block.RefreshPosition(MeetingBlockProgressBar.ScopeLengthMinutes, this.scopeEndLocal);//BarBlockGridParent); //Refresh their screen position and width
        }

        //if (showNoMeetingsText)
        //{
        //    NoContentLbl.Text = "No meetings found";
        //    NoContentLbl.Visibility = Visibility.Visible;
        //}
        //else { NoContentLbl.Text = ""; NoContentLbl.Visibility = Visibility.Collapsed; }

        //Recalculate our height
        let a = 5 * Math.max(0, this.curRowCount-1); //spacing
        let b = this.curRowCount * 50; //block height itself
        this.lastMBlockParentHeight = (a+b);
        this.meetingBlockParent.height(this.lastMBlockParentHeight);
    }

    private CreateMissingMeetingBlockDatas2(rows: BlockRow[])
    {
        let a: Meeting[][] = [];
        for (var row of rows)
        {
            a.push(row.Meetings);
        }
        this.curRowCount = rows.length;
        const rowHeight = 50;
        const rowSpacing = 5;
        for(let rowIndex = 0; rowIndex < rows.length; ++rowIndex)
        {
            var row = rows[rowIndex];
            //Create row div
            let el = $("<div class='mblockrow' style='margin-top:"+((rowIndex*rowHeight)+(rowSpacing*rowIndex))+"px'></div>").appendTo(this.meetingBlockParent);
            this.rows.push(el.get(0));
            for(let i = 0; i < row.Meetings.length; ++i)
            {
                let meetingBlock = new MeetingBlockData(row.Meetings[i]);
                //meetingBlock.RowCountInStack = row.Rows.length; //Used to scale the meeting block on the Y axis
                meetingBlock.RowIndex = rowIndex; //Used to position the meeting block on the Y axis
                this.meetingBlockDatas.push(meetingBlock);
                this.graphicalMeetingBlocks.push(this.CreateMeetingBlock(meetingBlock, el));
            }
        }
    }
    
    private CreateMeetingBlock(data:MeetingBlockData, parent): MeetingBlock
    {
        let block = new MeetingBlock(parent);
        block.Init(data, this);
        return block;
    }
    public DestroyMeetingBlock(block:MeetingBlock)
    {
        block.element.remove();
        console.log("Todo: rearrange blocks after block deletion");
    }

    private timeMarksByHour: Map<number, TimeMarkData> = new Map<number, TimeMarkData>();
    private graphicalTimeMarks: TimeMark[] = [];
    private CreateMissingTimeMarkDatas(nowLocal:DateTime, endLocal:DateTime)
    {
        //First, create timeline objects for each hour that isnt displayed
        var totalHours = DateTime.HoursBetween(nowLocal, endLocal, true) + 1;
        var startHour = nowLocal.Hour;
        let startHourTime = nowLocal;
        startHourTime = startHourTime.AddMinutes(-startHourTime.Minute);
        startHourTime = startHourTime.AddSeconds(-startHourTime.Second);

        let hoursToDisp:number[] = [];
        for (let i = 0; i < totalHours; ++i)
        {
            var hour = startHour + i;
            if (hour >= 24) { hour -= 24; }
            hoursToDisp.push(hour);
        }

        for (var hour of hoursToDisp)
        {
            let alreadyExists = this.timeMarksByHour.has(hour);
            if (!alreadyExists)
            {
                //Create a datetime
                let hourMark = startHourTime.AddHours((-startHourTime.Hour) + (hour));
                //Create a data
                let markData = new TimeMarkData(hourMark);

                console.log("Create time mark");
                //Create mark
                var mark = this.CreateTimeMark(markData);
                this.timeMarksByHour.set(hour, markData);
                this.graphicalTimeMarks.push(mark);
            }
        }

        //Remove timelines where the hour has expired
        /* var pairs = this.timeMarksByHour.ToArray();
        for (var pair of pairs)
        {
            var hour = pair.Key;
            //if (!hoursToDisp.includes(hour)) { timeMarksByHour.Remove(hour); }
        } */

        //Update and reposition all lines, remove expired lines
        /* pairs = this.timeMarksByHour;
        for (var pair of pairs)
        {
            var t = pair.Value;
            t.UpdateScope(nowLocal, endLocal);
            //if (t.HasExpired) { this.timeMarksByHour.Remove(pair.Key); }
        } */
    }
    //Update the data in the timemarkdatas
    private UpdateScope_TimeMarks(nowLocal:DateTime, endLocal:DateTime)
    {
        this.timeMarksByHour.forEach((val, key)=>{
            val.UpdateScope(nowLocal, endLocal);
            val.CalcPosition(MeetingBlockProgressBar.ScopeLengthMinutes, endLocal);
        });
    }
    //Reposition graphical marks
    private RefreshDisplayedTimeMarks()
    {
        let index = 0;
        for (let i = 0; i < this.graphicalTimeMarks.length; ++i)
        {
            let mark = this.graphicalTimeMarks[i];
            let active = mark.RefreshPosition(MeetingBlockProgressBar.ScopeLengthMinutes, this.scopeEndLocal, index);
            if(!active){index--;}
            index++;
            mark.element.height(this.lastMBlockParentHeight+10);
        }
    }

    private CreateTimeMark(data:TimeMarkData): TimeMark
    {
        let mark = new TimeMark(this.timeMarkParent);
        mark.Init(data, this);
        return mark;
    }
    public DestroyTimeMark(mark:TimeMark){
        mark.element.remove();
    }
    public UpdateLoop()
    {
        this.RefreshGraphicalBlocks();
        this.RefreshDisplayedTimeMarks();
    }

    private AdaptToColorScheme()
    {
        //var s = ColorScheme.Scheme;
        //this.GetComponent<Image>().color = s.ProgressBarColor;
    }
}
