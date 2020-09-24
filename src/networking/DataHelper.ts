import { IDTask } from "./IDTask";
import { NetTalker } from "./nettalker";

export class DataHelper
{
    //private static _token : JToken;
    public static Token : JToken;
    //public static get Token() : JToken{return this._token; }
    //public static List<JUser> AllUsers;

    public static NeedsTokenRefresh() : boolean
    {return DataHelper.Token == null || DataHelper.Token.HasExpired();}

    public static async RefreshTokenAsync(task : IDTask)
    {
        await DataHelper.RefreshTokenAsync2(task.GetIntermediaryCallback(), task.TaskID);
    }
    private static async RefreshTokenAsync2(callback, taskID: number)
    {
        await DataHelper.getTokenNoUserAsync(callback, taskID);
    }

    public static async getTokenNoUserAsync(callback, taskID: number) : Promise<JToken>
    {
        //CurrentGets++;
        let token = await NetTalker.getToken();
        let t = JToken.Create(token);
        DataHelper.Token = t;
        if(callback != null){callback(t, taskID);}
        //CurrentGets--;
        return t;
    }
}
export class JToken
{
    private _token_type: string = "";
    get token_type(): string { return this._token_type; }
    set token_type(value: string) { this._token_type = value;}

    private _expires_in: number = 0;
    get expires_in(): number { return this._expires_in; }
    set expires_in(value: number) { this._expires_in = value;}

    private _ext_expires_in: number = 0;
    get ext_expires_in(): number { return this._ext_expires_in; }
    set ext_expires_in(value: number) { this._ext_expires_in = value;}

    private _access_token: string = "";
    get access_token(): string { return this._access_token; }
    set access_token(value: string) { this._access_token = value;}

    public static Create(data) : JToken
    {
        var t = new JToken();
        t.access_token = data.access_token;
        t.token_type = data.token_type;
        t.expires_in = data.expires_in;
        t.ext_expires_in = data.ext_expires_in;
        return t;
    }
    public static Parse(json:string) : JToken
    {
        var data = JSON.parse(json);
        var t = new JToken();
        t.access_token = data.access_token;
        t.token_type = data.token_type;
        t.expires_in = data.expires_in;
        t.ext_expires_in = data.ext_expires_in;
        return t;
    }

    public HasExpired() : boolean
    {
        return false;
    }
    public ExpiresWithin(minutes: number) : boolean
    {
        return false;
    }
}