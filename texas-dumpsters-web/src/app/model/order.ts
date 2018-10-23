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
import {Site} from "./site";
import {Customer} from "./customer";

export class Order extends ServerEntity{

	constructor(){
    super();
  }

	id:string="";
	source_system_id:string="";
	customer_key:string="";
	site_key:string="";
	assets:string="";
	instructions:string="";
	notes:string="";
	driver_entry_info:string="";
	active:boolean=false;
	company_key:string="";
	service_date:string="";
	service_time_frame:string="";
	purpose_of_service:number=0;
	state:number=0;
	site:Site;
	quantity:number=0;
	asset_size:number=0;
	customer:Customer;
	service_ticket_id:string="";

  parseServerResponse(response){
		super.parseServerResponse(response);

    this.site=new Site();
		this.site.parseServerResponse(response.site);

		this.customer=new Customer();
		this.customer.parseServerResponse(response.customer);
  }

  /**
   *
   *
   * */
  getFormattedAddress():String{
    return this.site.getFormattedAddress();
  }

}
