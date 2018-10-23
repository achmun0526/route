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

export class Yard extends ServerEntity{

	constructor(){
    super();
  }

	id: string = "";
	company_key : string = "";
  yard_name : string = "";
  yard_address : string = "";
  yard_zipcode : string = "";
  yard_state : string = "";
  yard_city : string = "";
  contact_name : string = "";
  contact_email : string = "";
  contact_phone : string = "";
  active : boolean;
	latitude: string = '';
  longitude: string = '';

  /**
   *
   *
   * */
  getFormattedAddress():String{
    return this.yard_address+', '+this.yard_city+', '+this.yard_state+', '+this.yard_zipcode;
  }

}
