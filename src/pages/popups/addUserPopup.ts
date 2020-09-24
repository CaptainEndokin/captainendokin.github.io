import $ from "jquery";
import 'jquery-ui-bundle';  
import { Person } from "../../data/person";
import { PersonBlock } from "../calendarpage/personblock";
import { AddUserBlock } from "../adduserpage/addUserBlock";
import { NetTalker } from "../../networking/nettalker";
import { CalendarPage } from "../calendarpage/calendarPage";

export class AddUserPopup{

    private root: JQuery<HTMLElement>;
    private btnBack: JQuery<HTMLElement>;
    private lbl: JQuery<HTMLElement>;
    private list: JQuery<HTMLUListElement>;
    private input: HTMLInputElement;
    private searchBtn: JQuery<HTMLElement>;
    public static instance: AddUserPopup;
    private curPerson: Person;

    constructor(){

        AddUserPopup.instance = this;
        this.root = $("#addUserPopup");
        this.list = (<JQuery<HTMLUListElement>>this.root.find("#addUserBlockList"));
        this.input = <HTMLInputElement>(this.root.find("input").get(0));
        this.searchBtn = this.root.find("#searchBtn");
        this.lbl = this.root.find("#resultslbl");
        this.lbl.text("");
        this.bindButtons();
        this.searchBtn.click(this.Search);
        this.clearShown();
    }

    private bindButtons(){
        let btnBack = this.root.find("#btnback");
        btnBack.click(this.GoBack);
    }


    private Search=()=>{
        let term = this.input.value;
        console.log("Term: " + term);
        this.clearShown();
        if(term.length<1){return;}

        //Lets look for some results online
        let json = NetTalker.searchByPrincipal(term);
        json.catch((reason) =>
        {console.error(reason);})
        json.then((value) =>{ //Wait for promise to be filled
            console.log("Search results: " + value.value.length);
            if(value.value.length < 1){
                //Print that no results were found
                this.lbl.html("No user found");
                return;
            }
            this.lbl.html("");
            for(let i = 0; i < value.value.length && i < 1; ++i){
                let hit:any = value.value[i];
                var person = Person.CreatePerson(hit);
                //Search for match in already cached
                let alreadyExists = Person.IsCached(person);
                if(alreadyExists){ this.lbl.html("User already cached!"); continue;}
                else{
                    //Todo: check that person object is healthy
                    let b = new AddUserBlock(this.list.get(0), person);
                    b.UserConfirmedCallback = this.OnUserConfirmed;
                    this.list.show();
                }
            }
            
        });
    }
    private GoBack=()=>{
        this.Hide();
    }
    private OnUserConfirmed=()=>{
        if(this.curPerson!=null) {  }
        CalendarPage.instance.RefreshObjects();
        this.lbl.html("");
        this.clearShown();
        this.Hide();
    }

    public Show=()=>{
        this.clearShown();
        this.root.css("display", "block");
    }
    public Hide=()=>{
        this.clearShown();
        this.input.value = "";
        this.lbl.text("");
        this.root.css("display", "none");
    }
    private clearShown(){
        this.curPerson = null;
        this.list.get(0).innerHTML = "";
        this.list.hide();
    }

    public Update() {
    }
}