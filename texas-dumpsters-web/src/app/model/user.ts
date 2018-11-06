import {ROLES, ROLE_NAMES} from "../common/app-conf";
import {ServerEntity} from "../common/server_entity";
import {Company} from "./company";
import {isNullOrUndefined} from "util";
export class User extends ServerEntity{
  email:String='';
  first_name:String='';
  last_name:String='';
  user_key:String='';
  id:string='';
  user_id:string='';
  roles:any[];
  company_key:string='';
  company:Company=null;
  contact_phone_desk: string='';
  contact_phone_mobile: string='';
  device_id:string='' ;
  activated:boolean=false;

	constructor(){
    super();
  }

  public parseServerResponse(serverResponseObject){
    super.parseServerResponse(serverResponseObject);
    if (serverResponseObject) {
      this.roles=serverResponseObject.roles;
      if (!isNullOrUndefined(serverResponseObject.company)){
        var company:Company=new Company();
        company.parseServerResponse(serverResponseObject.company);
        this.company=company;
      }
    } 
  }

  public getUserRole():String{
    if (this.roles && this.roles.length>0){
      return this.roles[0];
    }
    return "User";
  }

  /**
   *
   * */
  public hasAdminRole():boolean{
    return this.hasRoleGranted(ROLE_NAMES.ADMIN);
  }


  private hasRoleGranted(role:String):boolean{
    if (this.roles.length>0 && this.roles[0]===role){
      return true;
    }
    return false;
  }

}
