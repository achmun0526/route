/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 *
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/*
 * File:   main.cpp
 * Author: forest schwartz
 *
 * Created on December 12, 2017, 7:09 PM
 */

import { ServerEntity} from "../common/server_entity";
import { Customer } from "./customer";

export class Site extends ServerEntity{

	constructor(){
    super();
  }

	id: string = '';
	customer_key: string = '';
	source_system_id: string = '';
	site_name: string = '';
	company_key: string  = '';
	site_address: string = '';
	site_zipcode: string = '';
	site_state: string = '';
	site_city: string = '';
	latitude:string='';
	longitude:string='';
	contact_name: string = '';
	contact_email: string = '';
	contact_phone: string = '';
	active:boolean;
	customer:Customer=null;

	parseServerResponse(response){
		super.parseServerResponse(response);

		this.customer=new Customer();
		this.customer.parseServerResponse(response.customer);
  }

  /**
   *
   *
   * */
  getFormattedAddress():String{
    return this.site_address+', '+this.site_city+', '+this.site_state+', '+this.site_zipcode;
  }

}
