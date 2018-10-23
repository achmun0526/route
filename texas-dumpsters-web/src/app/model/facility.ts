import { ServerEntity} from "../common/server_entity";

export class Facility extends ServerEntity{

	constructor(){
    super();
  }
	id: string = "";
	company_key : string="" ;
  facility_name : string="" ;
  facility_address : string="" ;
  facility_zipcode : string="" ;
  facility_state : string="" ;
  facility_city : string="" ;
  contact_name : string="" ;
  contact_email : string="" ;
  contact_phone : string="" ;
  hours_of_operation : string="";
  active : boolean ;
	latitude: string = '';
  longitude: string = '';


  /**
   *
   *
   * */
  getFormattedAddress():String{
    return this.facility_address+', '+this.facility_city+', '+this.facility_state+', '+this.facility_zipcode;
  }
}
