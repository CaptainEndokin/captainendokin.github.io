import $ from "jquery";
import 'jquery-ui-bundle';
import { Person } from "../../data/person";

export class AddUserBlock{
    private body: JQuery<HTMLElement>;
    private icon;
    private btnadd: JQuery<HTMLElement>;
    private btnaddimg: JQuery<HTMLElement>;
    private isMarked:boolean;
    private person: Person;
    public UserConfirmedCallback: () => void;

    constructor(parentElement: HTMLElement, person:Person){
        this.person = person;
        this.body = $("<div class='addUserBlock'></div>").appendTo($("<li></li>").appendTo(parentElement));
        this.icon = $("<img class='addUserBlockImg' src='../../../imgs/gubbeIcon.png'></img>").appendTo(this.body);
        let lbl = $("<label>"+person.firstname+" "+ person.surname+"</label>").appendTo(this.body);
        //Buttons
        this.btnadd = $("<button class='addUserBtnAdd'></button>").appendTo(this.body);
        this.btnadd.click(this.onBtnAdd);
        this.btnaddimg = $("<img src='../../../imgs/checkmark2.png'></img>").appendTo(this.btnadd);
        //Check if already marked
        if(Person.IsCached(this.person)){
            (<HTMLImageElement>this.btnaddimg.get(0)).src = "src='../../../imgs/checkmark2a.png";
            this.isMarked = true;
        }
        //this.btnaddimg = $("<img src=></img>").appendTo(this.btnadd);
    }

    private onBtnAdd =()=> {
        this.isMarked = !this.isMarked;
        if(this.isMarked){
            (<HTMLImageElement>this.btnaddimg.get(0)).src = "src='../../../imgs/checkmark2a.png";
            Person.cachedPersons.push(this.person);
        }
        else{
            (<HTMLImageElement>this.btnaddimg.get(0)).src = "src='../../../imgs/checkmark2.png";
        }
        if(this.UserConfirmedCallback != null){this.UserConfirmedCallback();}
    }
}