import { NetTalker } from "./src/networking/nettalker";
import { PersonBlock } from "./src/pages/calendarpage/personblock";
import { Person } from "./src/data/person";
import { CalendarPage } from "./src/pages/calendarpage/calendarPage";
import { Main } from "./src/pages/main";
import { DataHelper } from "./src/networking/DataHelper";
import { IDTask } from "./src/networking/IDTask";
import { DateTime } from "./src/dateTime";
import { MeetingGetter } from "./src/networking/meetingGetter";

//type 'npm run rebuild' into the terminal to recompile everything into webpack, so the index.html can read it

console.log("hello");
let startPrincipals:string[] = ["nicolas.ljungvall@simrishamn.se"];




//NetTalker.getToken();
//NetTalker.searchByPrincipal("nicolas.ljungvall@simrishamn.se");

var addPerson:Function = (data:any) => { 
    var person = Person.CreatePerson(data);
    console.log(person.surname);
    Person.cachedPersons.push(person);
}

var onTokenGet:Function = () => {
    console.log("Token get");
    console.log(DataHelper.Token.access_token);
    let waiting:number = 0;

    for(let i = 0; i < startPrincipals.length; ++i){
        ++waiting;
        let json = NetTalker.searchByPrincipal(startPrincipals[i]);
        json.catch((reason) =>
        {waiting--; console.error(reason);
            if(waiting<1){Main.GoToCalendarPage();}})
        json.then((value) =>{ //Wait for promise to be filled
            //Add person to cache, so that calendar page renders it when it loads
            addPerson(value.value[0]);
            //Load calendar page
            --waiting;
            if(waiting<1){Main.GoToCalendarPage();}
        });
    }
}

function onTimerTick() {
    // Do stuff.
    if(Main.currentPage != null){Main.currentPage.Update();}
    
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

let cookie = getCookie("pass");
if(cookie != "brunnsparken"){
console.log("felaktigt lösen");
}
else{
    console.log("ok lösen");
    DataHelper.RefreshTokenAsync(IDTask.CreateVoid(onTokenGet));
    setInterval(onTimerTick, 33); // 33 milliseconds = ~ 30 frames per sec
}


