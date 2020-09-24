import $ from "jquery";
import 'jquery-ui-bundle';
import { TimeMarkData } from "./timescaleObj";
import { MeetingBlockProgressBar } from "./meetingBlockProgressBar";
import { DateTime } from "../../dateTime";

export class TimeMark{
    private parent: MeetingBlockProgressBar;
    private showMeetingName;
    private showMeetingLocation;
    private showMeetingTime;
    public Data: TimeMarkData;
    public element: JQuery<HTMLElement>;
    private lbl: JQuery<HTMLElement>;
    public timeMarkIndex = 0;

    constructor(parent: JQuery<HTMLElement>){
        this.createElement(parent);
    }
    private createElement(parentElement:any){
        this.element = $("<div class='tmark'></div>").appendTo(parentElement);
        this.lbl = $("<p></p>").appendTo(this.element);
        $("<div class='tmark_line'></div>").appendTo(this.element);
        //this.lbl = $("<p>Meeting Block</p>").appendTo(this.body);
    }

    public Init(data: TimeMarkData, progressBar:MeetingBlockProgressBar)
    {
        this.parent = progressBar;
        this.Data = data;
        this.lbl.html(data.StartTimeLocal.toString24hr());

        //nameLbl.Text = b.Label;
        //timeLbl.Text = StringHelper.WriteDigitalTime(b.StartTimeLocal) + " - " + StringHelper.WriteDigitalTime(b.EndTimeLocal);
        this.SetBackground(true);
        //TimeLbl.text = data.TimeToDisplay.ToString("HH:mm"); //data.StartTimeLocal.Hour.ToString();
        //gameObject.name = "Timemark for " + TimeLbl.text;
    }

    public RefreshPosition(scopeLengthMinutes: number, scopeEndLocal: DateTime, index:number) : boolean
    {
        if(!this.Data.InsideScope){
            //This timemark has left the visible scope, time to delete it
            this.parent.DestroyTimeMark(this); return false;
        }
        let widthStartPerc = this.Data.LastStartTimePerc;
        const myWidth = 5;
        let offsetFix = 0; //(myWidth*(index+1))/795.5;
        //const fixMult = 0.9783709942;
        //widthStartPerc = widthStartPerc*fixMult;
        this.element.get(0).style.marginLeft = (((widthStartPerc-offsetFix)*100).toString()+"%");
        //this.element.get(0).style.left = "2.5px"; //Put the middle of the line exactly at the correct time mark. This assumes the mark width is 5px.
        return true;
    }

    public SetBackground(busy:boolean)
    {
        //myGrid.Background = new SolidColorBrush(Windows.UI.Color.FromArgb(255, 255, 0, 0));
    }

    private ScaleLabels()
    {
        let baseSize = 20;
        let baseWidth = 200;

        //double curWidth = myGrid.ActualWidth;
    }


    public Update()
    {

    }
}