import { Page, Main } from "../main";
import $ from "jquery";
import 'jquery-ui-bundle';
import { AddUserBlock } from "./addUserBlock";
import { Person } from "../../data/person";
import { NetTalker } from "../../networking/nettalker";

export class AddUserPage{

    private root: JQuery<HTMLElement>;
    private list: JQuery<HTMLUListElement>;
    private input: HTMLInputElement;
    private searchBtn: JQuery<HTMLElement>;
    public static instance: AddUserPage;
    private lbl : JQuery<HTMLElement>;
    private shownBlock : AddUserBlock;


    constructor(){
        AddUserPage.instance = this;
        this.root = $("#adduserPage");
        this.list = (<JQuery<HTMLUListElement>>this.root.find("#addUserBlockList"));
        this.input = <HTMLInputElement>(this.root.find("input").get(0));
        this.searchBtn = this.root.find("#searchBtn");
        this.lbl = this.root.find("#resultslbl");
        this.bindButtons();
        this.searchBtn.click(this.doSearch);
        this.clearShown();
        console.log(this.searchBtn);
        console.log(this.input);
    }

    public NavigateTo(){
        this.root.show();
    }
    public Close(){
        this.root.hide();
    }
    private bindButtons(){
        let btnBack = this.root.find("#btnback");
        btnBack.click(this.onBackBtn);
    }
    private onBackBtn=()=>{
        this.clearShown();
        Main.GoToCalendarPage();
    }
    private something = () =>{
        this.lbl.html("");
        this.clearShown();
        Main.GoToCalendarPage();
    }

    private doSearch=()=>{
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
                //Todo: check that person object is healthy
                let b = new AddUserBlock(this.list.get(0), person);
                b.UserConfirmedCallback = this.something;
            }
            this.list.show();
        });
    }
    private clearShown(){
        this.list.get(0).innerHTML = "";
        this.list.hide();
    }

    public Update() {
    }
}