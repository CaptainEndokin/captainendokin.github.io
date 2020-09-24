import $ from "jquery";
import 'jquery-ui-bundle';
import { PersonBlock } from "./personblock";
import { MeetingBlockData } from "./timescaleObj";
import { MeetingBlockProgressBar } from "./meetingBlockProgressBar";
import { DateTime } from "../../dateTime";

export class MeetingBlock{

    private parent: MeetingBlockProgressBar;
    public element: JQuery<HTMLElement>;
    private lbl: JQuery<HTMLElement>;
    private BlockData: MeetingBlockData;
    

    constructor(parentElement:any){
        this.createElement(parentElement);
    }

    private createElement(parentElement:any){
        this.element = $("<div class='mblock'></div>").appendTo(parentElement);
        this.lbl = $("<p style='text-overflow: ellipsis; overflow:hidden; white-space: nowrap;'>Meeting Block</p>").appendTo(this.element);
    }
    public Init(blockData:MeetingBlockData, parent:MeetingBlockProgressBar){
        this.parent = parent;
        this.BlockData = blockData;
        //Set label
        //this.lbl.html(this.BlockData.StartTimeLocal.toString24hr()+ "-"+ this.BlockData.EndTimeLocal.toString24hr());
        this.lbl.html(this.BlockData.Title);
        let showas = this.BlockData.Meeting.showAs.toLowerCase();
        if(showas=="busy"){this.element.addClass("mblock-busy");}
        else if(showas=="free"){this.element.addClass("mblock-free");}
        else if(showas=="tentative"){this.element.addClass("mblock-tentative");}
        //let col = MeetingBlockData.Color_ShowAs(this.BlockData.Meeting.showAs);
        //this.element.css("background", col);
        this.lbl.addClass("tooltip");
        let sp = $("<div class='tooltiptext'></div>").appendTo(this.lbl);
        let strings = [];
        strings.push(this.BlockData.Title);
        strings.push(this.BlockData.StartTimeLocal.toString24hr()+ " - "+ this.BlockData.EndTimeLocal.toString24hr());
        strings.push(this.BlockData.GetStatusString());
        let x = "";
        for(let i = 0; i < strings.length; ++i){
            let s = strings[i];
            if(s!=null&&s.length>0){$("<p>"+s+"</p>").appendTo(sp);}
        }
    }
    public RefreshPosition(scopeLengthMinutes: number, scopeEndLocal: DateTime)
    {
        if(this.BlockData.HasExpired){
            console.error("We have expired!");
        }

        if (this.BlockData.HasExpired || !this.BlockData.InsideScope) {
            console.error(this.BlockData.Meeting.MeetingName + " or is not inside scope! Todo: Destroy me?");
            this.parent.DestroyMeetingBlock(this); return;
        }

        this.BlockData.CalcWidthPercs(scopeLengthMinutes, scopeEndLocal); //Calculates length based on meeting duration

        let widthStartPerc = this.BlockData.LastStartTimePerc;
        let widthPerc = this.BlockData.LastWidthPerc; //BlockData.LastWidthRemainingPerc;

        this.element.get(0).style.width = (widthPerc*100).toString() + "%";
        this.element.get(0).style.marginLeft = ((widthStartPerc*100).toString()+"%");

    }
    public Destroy() : void{
        this.element.remove();
    }
}