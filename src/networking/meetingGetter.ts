import { Person } from "../data/person";
import { Meeting } from "../data/meeting";
import { DataHelper } from "./DataHelper";
import { DateTime } from "../dateTime";
import { TimeHelper } from "../timeHelper";
import { Photo } from "../data/photo";

export class MeetingGetter {

    public static async GetMeetings (p: Person): Promise<Meeting[]>
    {
        let token = DataHelper.Token.access_token;//p.token;
        return await MeetingGetter.GetMeetings2(p, token);
    }
    public static async GetMeetings2(forPerson: Person, token: string)
    {
        //Problem: MS Graph filters away meetings that START before our search window, even if they END in our search window.
        var from = TimeHelper.CurTime.AddDays(-1); //So we need to look quite far back into the past to make sure there arent any REALLY long meetings that are still ongoing
        var then = TimeHelper.CurTime.AddDays(1); //Look for meetings as far as 1 day in advance
        console.log("SEARCH: Looking for meetings between " + from.toStringDateTimeSpoken() + " and " + then.toStringDateTimeSpoken());
        let url = this.url_getEventsBetween(from, then, forPerson.principal);
        const meta = {
            method: "GET",
            headers:{"Content_Type": "application/json", "Authorization": "Bearer " + token}
        }

        let resp = await fetch(url, meta);
        //console.log(resp)
        let json = await resp.json();//response.Content.ReadAsStringAsync();
        //console.log(json);
        var parsedMeetings = await MeetingGetter.ParseMeetings(json, forPerson, true, from, then); //Parse meetings from JSON
        console.log("SEARCH: Meetings parsed. Returning " + parsedMeetings.length + " meetings to calendar page");
        return parsedMeetings;
    }

    private static url_getEventsBetween(from: DateTime, to: DateTime, principal: string) :string
        {
            https://docs.microsoft.com/en-us/graph/api/user-list-calendarview?view=graph-rest-1.0&tabs=http
            //We can add a timezone suffix to the string like this "-08:00". But if we don't do that, MS Graph thinks we are sending UTC
            //So lets send UTC time
            if (!from.isUTC) { from = from.ToUniversalTime(); }
            if (!to.isUTC) { to = to.ToUniversalTime(); } //Simplest thing is to send the dates in UTC
            let s = "https://graph.microsoft.com/v1.0/users/" + principal + "/calendar/events?"; //start format
            s += "startdatetime=" + from.toStringMicrosoftYYYYMMDDHHMMSS()
            + "&enddatetime=" + to.toStringMicrosoftYYYYMMDDHHMMSS();
            return s;
    }

    static async ParseMeetings(data, p: Person, convertFromUTC: boolean, fromTime:DateTime, toTime:DateTime) : Promise<Meeting[]>{

        if (data.value == null) { console.log("Failed to find any meetings to parse"); return null; }
            let parsedMeetings = [];
            console.log("PARSE: Begin parsing " + data.value.length + " events...");
            for(let i = 0; i < data.value.length; ++i){
                let d = data.value[i];
                let key = i + "/" + (data.value.length-1);
                let m = Meeting.Load(d,p,convertFromUTC); //Create a meeting object from the JSON
                if(m.IsSeriesMaster) {
                    console.log("PARSE: Series master encountered: " + m.MeetingName);
                    //Get child meetings instead
                    let children = await this.GetSeriesInstances(fromTime, toTime, m.person, m.person.principal, m.id);
                    for(let j = 0; j < children.length; ++j)
                    {
                        let c = children[j];
                        if(!c.HasEnded()){
                            parsedMeetings.push(c);
                        }
                    }
                }
                else{
                    console.log("Non-seriesMaster meeting found ("+m.timeStart_local.toStringMicrosoftYYYYMMDDHHMMSS() + " - " + m.timeEnd_local.toStringMicrosoftYYYYMMDDHHMMSS() +"). Has expired? " + m.HasEnded());
                    if(!m.HasEnded()){
                        parsedMeetings.push(m); //Add to the list of parsed meetings
                    }
                }
            }
            console.log("PARSE: Done parsing " + data.value.length + " events. Returning " + parsedMeetings.length + " results");
            return parsedMeetings;
    }

    public static async GetSeriesInstances(from: DateTime, to: DateTime, forPerson: Person, principal:string, meetingID: string) : Promise<Meeting[]>{

        let url = "https://graph.microsoft.com/v1.0/users/" + principal + "/calendar/events/"; //start format
        url += meetingID + "/instances?";
        url += "startDateTime=" + from.toStringMicrosoftYYYYMMDDHHMMSS()
            + "&endDateTime=" + to.toStringMicrosoftYYYYMMDDHHMMSS();
        let token = DataHelper.Token.access_token;
        const meta = {
            method: "GET",
            headers:{"Content_Type": "application/json", "Authorization": "Bearer " + token}
        }
        //console.log("Pinging " + url);
        let resp = await fetch(url, meta);
        //console.log(resp)
        let json = await resp.json();//response.Content.ReadAsStringAsync();
        console.log("SERIES: Querying for child meetings, recieved " + json.value.length + " matches within timeframe ("+from.toStringMicrosoftYYYYMMDDHHMMSS() + " - " + to.toStringMicrosoftYYYYMMDDHHMMSS() +") specified. Requesting parse.");
        //var meetingDatas = Calendar2.CalendarReturn.Parse(json, true);
        var parsedMeetings = await MeetingGetter.ParseMeetings(json, forPerson, true, from, to); //TODO: TRY THIS
        for(let i = 0; i < parsedMeetings.length; ++i){parsedMeetings[i].IsChildInstance=true;}
        console.log("SERIES: Requested parse complete.");
        //ALSO, TRY TO AVOID ENDLESS LOOP OF SERIES PARSING
        return parsedMeetings;
    }

    
    private static async GetPhotoMetaData(p: Person, token:string) : Promise<any>{
        let url = "https://graph.microsoft.com/v1.0/users/" + p.principal + "/photo";
        const meta = {
            method: "GET",
            headers:{"Content_Type": "application/json", "Authorization": "Bearer " + token}
        }
        //Ask for data about the image, such as what address its on, how big it is, etc
        let resp = await fetch(url, meta);
        //console.log(resp)
        //let json = await resp.json();//response.Content.ReadAsStringAsync();
        console.log(resp);
        let json = await resp.json();//response.Content.ReadAsStringAsync();
        console.log(json);
        //We can now determine IF the user has a photo, and what to do

        //For now, lets assume there is a photo, so lets get that


        return json;
    }
    public static async GetPhoto(p: Person, token:string) : Promise<Photo>{

        let metaData = this.GetPhotoMetaData(p, token);


        let url = "https://graph.microsoft.com/v1.0/users/" + p.principal + "/photo/$value";
        const meta = {
            method: "GET",
            headers:{"Content_Type": "application/json", "Authorization": "Bearer " + token}
        }
        //Ask for data about the image, such as what address its on, how big it is, etc
        let resp = await fetch(url, meta);
        //console.log(resp)
        //let json = await resp.json();//response.Content.ReadAsStringAsync();
        console.log(resp);
        let json = await resp.json();//response.Content.ReadAsStringAsync();
        console.log(json);
        //Get the binary photo data somehow
        

        return resp;
    }
}