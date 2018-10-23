import { ServerEntity} from "../common/server_entity";
import {RouteItem} from "./routeItem";
import {User} from "./user";
import {Vehicle} from "./vehicle";
import {Company} from "./company";

export class ServiceRoute extends ServerEntity{

	constructor(){
    super();
  }

	id : string = "";
	date: Date =new Date();
	driver_key: string ="" ;
	driver:User=null;
	vehicle_key: string ="" ;
	vehicle:Vehicle=null;
  notes: string ="" ;
  company: Company=null;
	company_key: string ="" ;
	route_items: RouteItem[] =[];
	active: boolean ;
	origin: string="";
	destination: string="";
	time =0;
	distance =0;


	/**
   *
   *
   * */
  parseServerResponse(response){
    super.parseServerResponse(response);
    if (response.route_items) {
      this.route_items = [];
      for (let item of response.route_items) {
        var routeItem = new RouteItem();
        routeItem.parseServerResponse(item);
        this.route_items.push(routeItem);
      }
    }
    var temp:User=new User();
    temp.parseServerResponse(response.driver)
    this.driver=temp;

    var temp2:Vehicle=new Vehicle();
    temp2.parseServerResponse(response.vehicle)
    this.vehicle=temp2;

    var temp3:Company=new Company();
    temp3.parseServerResponse(response.company);
    this.company=temp3;
  }

	populate_route_items(route_item){

		this.route_items.push(route_item);
	}

	get_number_of_route_items(){
		return this.route_items.length;
	}

}
