import { DataHelper } from "./DataHelper";

export class NetTalker{

    private static readonly clientID = "e17c1a50-59b3-4d1c-8933-135f443f6e48";
    private static readonly tenant = "d115055b-12fd-4ae1-a589-5a96753aca7a";
    private static readonly client_secret = "d0ftaDZah8+RLUehhmnKyGkQSeQxkEOHQ1BFARY+3Zo=";



    constructor(){}
    public static async test(){
        console.log("nettalker here");

        const url = "https://login.microsoftonline.com/" + this.tenant + "/oauth2/v2.0/token";
        const corsProxy = true;
        const url2 = (corsProxy? "https://cors-anywhere.herokuapp.com/" : "") + "https://postman-echo.com/post";
        var form = {
            "grant_type": "client_credentials",
            "client_id": this.clientID,
            "client_secret": this.client_secret,
            "scope": "https://graph.microsoft.com/.default"
        };

        let formData = new FormData();
        formData.append("grant_type", "client_credentials");
        formData.append("client_id", this.clientID);
        formData.append("client_secret", this.client_secret);
        formData.append("scope", "https://graph.microsoft.com/.default");
        /* Ok what the heck. Firefox lets me send message to MS Graph WITHOUT CORS, aslong as im not sending all the variables MS Graph asks for
        When i send all the variables MS Graph wants, THEN Firefox decides to trigger CORS and block me froms sending the message*/
        //SOLUTION: ENABLE "Allow CORS: Access-Control-Allow-Origin" ADDON FOR FIREFOX https://addons.mozilla.org/sv-SE/firefox/addon/access-control-allow-origin/?src=search

        var msgbody = await JSON.stringify(form);
        console.log(msgbody);
        const meta = {
            method: "POST",
            //headers:{"Content-Type": "application/x-www-form-urlencoded"},
            //headers:{'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
            //body: msgbody
            body: formData
        }

        let resp = await fetch(url, meta);
        console.log(resp);
        var json = await resp.json();
        console.log(json);
    }
    //DO NOT DELETE THIS TEST FUNCTION!!!
    public static async test3(){
        console.log("nettalker here");

        //https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

        /*
            Becuase CORS messes with what we are trying to do, we need to circumvent it
            One way is to toggle off CORS in the webbrowser (havent tested that myself fully)
            Another way is to use a browser-plugin, like the one linked above. How it works, i dunno
            Third is to use a CORS proxy site, which acts like a middle hand between us and the target url
        */

        //For some reason right now, everything is working even though i turned off the plugin AND im not using a proxy. I guess I successfully disabled CORS in the browser afterall!
        //CORS mode and headers is not needed, the proxy adds that itself
        var options : RequestInit = {method:'GET', mode:'cors', headers: {'Access-Control-Allow-Origin':'*'}};
        var proxyUrl = //"https://thingproxy.freeboard.io/fetch/";
        "https://cors-anywhere.herokuapp.com/";
        var url = "https://jsonplaceholder.typicode.com/todos/1";
        let resp = await fetch(/*proxyUrl + */url);
            console.log(resp);
            var json = await resp.json();
            console.log(json);
    }
    public static async test2(){
        console.log("nettalker here");
        
        try{
            let resp = await fetch("https://reqres.in/api/users/2");
            console.log(resp);
        }
        catch(err){
            console.error(err);
        }
        
    }

    public static async getToken(): Promise<string>{
        const url = "https://login.microsoftonline.com/" + this.tenant + "/oauth2/v2.0/token";

        let formData = new FormData();
        formData.append("grant_type", "client_credentials");
        formData.append("client_id", this.clientID);
        formData.append("client_secret", this.client_secret);
        formData.append("scope", "https://graph.microsoft.com/.default");
        //ENABLE "Allow CORS: Access-Control-Allow-Origin" ADDON FOR FIREFOX https://addons.mozilla.org/sv-SE/firefox/addon/access-control-allow-origin/?src=search

        const meta = {
            method: "POST",
            body: formData
        }

        let resp = await fetch(url, meta);
        var json = await resp.json();
        return json;
    }

    public static async searchByPrincipal(principal:string){

        let token = DataHelper.Token.access_token;

        let search = "&$filter=userPrincipalName eq '" + principal + "'";
        let url = "https://graph.microsoft.com/v1.0/users" +
        "/?$top=999&$select=userPrincipalName,id,givenName,displayName,surname" + search;

        const meta = {
            method: "GET",
            headers:{"Content_Type": "application/json", "Authorization": "Bearer " + token}
        }

        let resp = await fetch(url, meta);
        console.log(resp);
        var json = await resp.json();
        console.log(json);
        return json;
    }

    
}