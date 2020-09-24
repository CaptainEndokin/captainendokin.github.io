import { DateTime } from "./dateTime";

export class TimeHelper
{
    /// <summary>
    /// Returns true if curTime is before laterTime
    /// </summary>
    public static IsBefore(curTime: DateTime, laterTime: DateTime) : boolean
    {
        return  curTime.TotalMilliseconds < laterTime.TotalMilliseconds; //DateTime.SecondsBetween(curTime, laterTime, false) > 0;
    }
    public static IsSameMinute(curTime: DateTime, laterTime: DateTime) : boolean
    {
        return (curTime.TotalMilliseconds / 60000 == laterTime.TotalMilliseconds / 60000);
        let diff = Math.abs(curTime.TotalMilliseconds - laterTime.TotalMilliseconds);
        
        if(diff <= 1000 * 60 && curTime.Minute == laterTime.Minute){return true;}
        return false;
    }
    public static SecondsBetweenAbs(a: DateTime, b: DateTime) : number
    {
        return DateTime.SecondsBetween(a, b, true);
    }
    public static get CurTime() : DateTime{ return DateTime.Now();}
    public static get CurTimeUTC() : DateTime{ return DateTime.Now();}
    /// <summary>
    /// Note: returned result will be negative if b is before a
    /// </summary>
   /*  public static MinutesBetween(DateTime a, DateTime b) : number
    {
        return (b - a).TotalMinutes;
    }
    /// <summary>
    /// Note: returned result will be negative if b is before a
    /// </summary>
    public static int HoursBetween(DateTime a, DateTime b) { return (int)(b - a).TotalHours; }
    public static DateTime AddMinutes(DateTime cur, int minutes) { return cur.AddMinutes(minutes); } */
}