export class Person {
    public firstname:string;
    public surname:string;
    public address:string;
    public imgsrc: string;
    public principal: string;
    public fullname: string;

    constructor(firstname: string){
        this.firstname = firstname;
    }

    

    public static CreatePerson(jsonData:any){
        var p = new Person(jsonData.givenName);
        p.surname = jsonData.surname;
        p.principal = jsonData.userPrincipalName;
        p.fullname = jsonData.displayName;
        return p;
    }


    public static backupimgsrc(){
        return "../../../imgs/gubbeIcon.png";
    }
    public static cachedPersons:Person[] = [];
    public static CachePerson(person:Person){
        this.cachedPersons.push(person);
    }
    public static IsCached(person:Person):boolean{
        return this.cachedPersons.indexOf(person) >= 0;
    }
    public static ForgetPerson(person:Person){
        if(!this.IsCached(person)){return false;}
        let i = this.cachedPersons.indexOf(person);
        this.cachedPersons.splice(i,1);
    }
}