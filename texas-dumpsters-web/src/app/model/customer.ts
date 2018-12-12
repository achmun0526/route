import { ServerEntity} from "../common/server_entity";

export class Customer extends ServerEntity{

	constructor(){
    super();
  }
	contact_email : string ="";
	contact_phone : string ="";
	company_key: string  = '';
	source_system_id: string  = '';
	source_system: string = '';
	customer_name: string = '';
	contact_name: string  = '';
	customer_contact: string = '';
	billing_address: string = '';
	billing_zipcode: string = '';
	billing_state: string = '';
	billing_city: string = '';
	id: string = '';
	notes: string = '';
	active:boolean;
}
