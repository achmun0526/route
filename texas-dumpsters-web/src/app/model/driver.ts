import { ServerEntity} from "../common/server_entity";

export class Driver extends ServerEntity{

	constructor(){
    super();
  }
	id: string = "";
	company_key : string="" ;
  driver_name : string="" ;
  driver_email : string="" ;
  driver_phone : string="" ;
	driver_id: string="";
	driver_operational: string="";
  active : boolean ;
}
