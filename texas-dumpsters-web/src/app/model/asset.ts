import {ServerEntity} from "../common/server_entity";

export class Asset extends ServerEntity{

  constructor(){
    super();
  }

  name:String='';
  id:String='';
  domain:String='';
  contact_phone:String='';
  contact_email:String='';
  address:String='';
	zipcode: string = '';
	state: string = '';
	city: string = '';
  vendor_notes:String='';
  service_pricing:String='';
  logo_name:String='';
  logo_url:String='';
  logo_data:String='';
  active:boolean=false;

}
