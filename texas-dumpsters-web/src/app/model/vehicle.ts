import { ServerEntity} from "../common/server_entity";

export class Vehicle extends ServerEntity{
	
	constructor(){
    super();
  }
	
	id : string = "";
 	company_key : string = "";
 	driver_key : string = "";
 	driver : string = "";
  vehicle_name : string = "";
  model : string = "";
  size : string = "";
  tag_number : string = "";
  active : string = "";

}