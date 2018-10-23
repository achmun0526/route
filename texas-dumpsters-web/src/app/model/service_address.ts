import { ServerEntity} from "../common/server_entity";

export class ServicesAddress extends ServerEntity{
	
	constructor(){
    super();
  }
	
	customer_key: string = '';
	id: string = '';
	address: string = '';
	zipcode: string = '';
	state: string = '';
	city: string = '';
	notes: string = '';
	active:boolean=false; 
}
