import {ServerEntity} from "../common/server_entity";

export class Company extends ServerEntity {

  constructor() {
    super();
  }

  name: string = '';
  id: string = '';
  domain: string = '';
  contact_phone: string = '';
  contact_email: string = '';
  address: string = '';
  zipcode: string = '';
  state: string = '';
  city: string = '';
  vendor_notes: string = '';
  service_pricing: string = '';
  logo_name: string = '';
  logo_url: string = '';
  logo_data: string = '';
  active: boolean = false;
  latitude: string = '';
  longitude: string = '';
}
