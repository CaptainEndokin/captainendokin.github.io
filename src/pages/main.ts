import { AddUserPage } from "./adduserpage/adduserpage";
import { CalendarPage } from "./calendarpage/calendarPage";
import { Person } from "../data/person";

export class Main{

    public static currentPage;

    public static GoToCalendarPage(){
        console.log("go to calendar view");
        if(this.currentPage!=null){this.currentPage.Close();}
        let p = CalendarPage.instance;
        if(p==null){p = new CalendarPage();}
        this.currentPage = p;
        p.NavigateTo();
    }

    public static GoToAddPage(){
        console.log("go to add person view");
        if(this.currentPage!=null){this.currentPage.Close();}
        let p = AddUserPage.instance;
        if(p==null){p = new AddUserPage();}
        this.currentPage = p;
        p.NavigateTo();
    }
}
export class Page{
    protected name:string = "";
    constructor(){

    }
    public NavigateTo(){
    }
    public Close(){
    }
}