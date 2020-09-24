import { Person } from "../../data/person";
import $ from "jquery";
import 'jquery-ui-bundle';
import { MeetingBlock } from "./meetingBlock";
import { Meeting } from "../../data/meeting";
import { BlockArranger } from "./blockArranger";
import { DateTime } from "../../dateTime";
import { TimeHelper } from "../../timeHelper";
import { MeetingBlockProgressBar } from "./meetingBlockProgressBar";
import { CalendarPage } from "./calendarPage";
import { MeetingGetter } from "../../networking/meetingGetter";
import { DataHelper } from "../../networking/DataHelper";

export class PersonBlock {
    
    public WidthTime = 60;
    private page: CalendarPage;
    private meetingBlockParent: JQuery<HTMLElement>;
    private meetingBlockProgressBar: MeetingBlockProgressBar;
    private person: Person;
    public get GetPerson(){return this.person;}
    public rootelement: JQuery<HTMLElement>;

    constructor(person:Person, parent: CalendarPage, parentElement:any){
        this.page = parent;
        this.person = person;
        this.createElement(parentElement);
        /*const me = [new Meeting(DateTime.Now().AddMinutes(60), DateTime.Now().AddMinutes(60*2)),
            new Meeting(DateTime.Now().AddMinutes(60*3), DateTime.Now().AddMinutes(60*4))];
            me.push(new Meeting(DateTime.Now().AddMinutes(30), DateTime.Now().AddMinutes(90)));
            me.push(new Meeting(DateTime.Now().AddMinutes(60*3), DateTime.Now().AddMinutes(60*4)));
        this.FeedMeetings(me);*/

        MeetingGetter.GetPhoto(this.person, DataHelper.Token.access_token);
            
    }

    private createElement(parent:any) {
        this.rootelement = $("<div class='personobj'></div>").appendTo(parent);
        let header = $("<div class='pobj_header'></div>").appendTo(this.rootelement);
        let img = <HTMLImageElement>($("<img class='pobj_header_icon'></img>").appendTo(header).get(0));
        img.src = Person.backupimgsrc();
        let lbl = $("<label></label>").appendTo(header);
        lbl.html(this.person.firstname + " " + this.person.surname);
        let btnDelete = $("<button class='pobj_header_btndel'></button>").appendTo(header);
        btnDelete.click(this.onDelete);
        let btndelimg = $("<img src='../../../imgs/trashbinWhite.png'></img>").appendTo(btnDelete);
        let pr = $("<div class='pobj_progressarea'></div>").appendTo(this.rootelement);
        //let tmp = $("<div></div>").appendTo(pr);
       // this.meetingBlockParent = $("<div></div>").appendTo(pr); //meeting block parent
        this.meetingBlockProgressBar = new MeetingBlockProgressBar(pr);
    }

    public FeedMeetings(meetings:Meeting[], refreshUI:boolean = true) {
        this.meetingBlockProgressBar.FeedMeetings(meetings, refreshUI);
    }
    public RefreshUI(){this.meetingBlockProgressBar.RefreshUI();}

    private onDelete=()=>{
        //Open popup menu
        let popup = CalendarPage.instance.confirmRemovePopup;
        popup.Setup(this.person, this);
        return;

        
    }
    public onDeleteConfirmed(p: Person){
        //Remove this obj and remove from personcache
        this.page.RemovePersonObj(this);
        Person.ForgetPerson(this.person);
    }
}