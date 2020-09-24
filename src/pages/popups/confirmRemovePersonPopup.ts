import $ from "jquery";
import 'jquery-ui-bundle';  
import { Person } from "../../data/person";
import { PersonBlock } from "../calendarpage/personblock";

export class ConfirmRemovePersonPopup{

    private root: JQuery<HTMLElement>;
    private btndel: JQuery<HTMLElement>;
    private lbl: JQuery<HTMLElement>;
    private isSetup = false;
    private person: Person;
    private block: PersonBlock;

    constructor(){
        this.root = $("#confirmRemovePersonPopup");
        this.btndel = this.root.find("#btndel");
        this.lbl = this.root.find("#crpplbl");
        this.lbl.text("undefined"); console.log("BTNDEL: ");
        console.log(this.btndel);
        this.btndel.click(this.Confirm);
        let btnCancel = this.root.find("#btncnl");
        btnCancel.click(this.Cancel);
    }

    public Setup(p: Person, pblock: PersonBlock){
        this.isSetup = false;
        this.person = p;
        this.block = pblock;
        this.lbl.text("Do you really want to remove " + p.fullname + "?");
        this.root.css("display", "block");
    }

    private Confirm=()=>{
        console.log("CONFIRM DELETE");
        if(this.block!=null && this.person!=null){
            this.block.onDeleteConfirmed(this.person);
        }
        
        this.Hide();
    }
    private Cancel=()=>{
        this.Hide();
    }
    
    public Hide=()=>{
        this.person = null;
        this.isSetup = false;
        this.lbl.text("undefined");
        this.root.css("display", "none");
    }
}