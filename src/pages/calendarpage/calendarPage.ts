import $ from "jquery";
import 'jquery-ui-bundle';
import { Person } from "../../data/person";
import { PersonBlock } from "./personblock";
import { Page, Main } from "../main";
import { DateTime } from "../../dateTime";
import { MeetingGetter } from "../../networking/meetingGetter";
import { TimeHelper } from "../../timeHelper";
import { ConfirmRemovePersonPopup } from "../popups/confirmRemovePersonPopup";
import { AddUserPopup } from "../popups/addUserPopup";

export class CalendarPage{

    private root: JQuery<HTMLElement>;
    private list: HTMLUListElement;
    public static instance: CalendarPage;
    private personObjs:PersonBlock[] = [];
    private lastRefreshTime : DateTime;
    private static readonly refreshIntervalSeconds = 10;
    private waitingSync = 0;
    public confirmRemovePopup : ConfirmRemovePersonPopup;
    public addUserPopup : AddUserPopup;

    constructor(){
        this.lastRefreshTime = TimeHelper.CurTime.AddHours(-1);
        CalendarPage.instance = this;
        this.root = $("#calendarPage");
        this.list = <HTMLUListElement>this.root.find("#calendarList").get(0);
        this.bindButtons();

        this.confirmRemovePopup = new ConfirmRemovePersonPopup();
        this.addUserPopup = new AddUserPopup();
    }

    public NavigateTo(){
        this.lastRefreshTime = TimeHelper.CurTime.AddHours(-1);
        for(let p of Person.cachedPersons){
            let b = new PersonBlock(p, this, this.list);
            this.personObjs.push(b);
        }
        this.root.show();
    }
    public Close(){
        this.list.innerHTML = "";
        this.root.hide();
    }

    public Update() {
        var timeSinceLastRefresh = Math.abs(DateTime.SecondsBetween(this.lastRefreshTime, TimeHelper.CurTime));
        if(this.waitingSync<1 && timeSinceLastRefresh >= CalendarPage.refreshIntervalSeconds){
            //Do refresh
            this.lastRefreshTime = TimeHelper.CurTime;
            this.RefreshEvents();
        }
    }
    private async RefreshEvents(){
        console.log("Refresh Events!");
        for(let i = 0; i < this.personObjs.length; ++i){
            this.waitingSync++;
            var pb = this.personObjs[i];
            var p = pb.GetPerson;
            console.log("CalendarPage Get Meetings:");
            var meetings = await MeetingGetter.GetMeetings(p);
            let x = 0; let y = 0;
            for(let j = 0; j < meetings.length; ++j){
                if(meetings[j].IsChildInstance){x=x+1;}
            }
            console.log(x + " out of " + meetings.length + " meetings recieved from search were child instances. Sending " + meetings.length + " meetings to ProgressBar.");
            console.log("The meetings being sent are:");
            for(let j = 0; j < meetings.length; ++j){
                console.log("Meeting #"+(j+1)+": " + meetings[j].timeStart_local.toStringDateTimeSpoken() + " - " + meetings[j].timeStart_local.toStringDateSpoken());
            }
            //When a promise is recieved, call a function that reduces waitingSync.
            //In that func, if waitingSync = 0, refresh the UI

            //SCRATCH THAT, now that the function is async, we dont have to do that
            --this.waitingSync;
            pb.FeedMeetings(meetings, false);
        }
        //Tell PersonBlocks to refresh their UI after the new data
        for(let i = 0; i < this.personObjs.length; ++i){this.personObjs[i].RefreshUI();}
    }

    public AddPersonObj(person:Person){
        let p = new PersonBlock(person, this, this.list);
        
    }
    private bindButtons(){
        let addbtn = this.root.find("#btnadd");
        addbtn.click(this.onAddBtn);
    }
    private onAddBtn=()=>{
        //Main.GoToAddPage();
        let popup = CalendarPage.instance.addUserPopup;
        popup.Show();
    }
    public RemovePersonObj(b: PersonBlock){
        let i = this.personObjs.indexOf(b);
        if(i<0){return;}
        let x = this.personObjs.splice(i, 1)[0];
        x.rootelement.remove();
    }
    public RefreshObjects():void{
        this.list.innerHTML = "";
        this.lastRefreshTime = TimeHelper.CurTime.AddHours(-1);
        for(let p of Person.cachedPersons){
            let b = new PersonBlock(p, this, this.list);
            this.personObjs.push(b);
        }
    }
}