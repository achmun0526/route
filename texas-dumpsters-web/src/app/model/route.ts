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
    console.log("in parseserverresponse");
    console.log("response.route_items");
    console.log(response.response.records);
    if (response.response.records) {
      console.log("in if response");
      this.route_items = [];
      for (let item of response.response.records) {
        var routeItem = new RouteItem();
        routeItem.parseServerResponse(item);
        this.route_items.push(routeItem);
      }
    }
    console.log("in parse server response before route items");
    console.log(this.route_items);
    var temp:User=new User();
    temp.parseServerResponse(response.driver);
    this.driver=temp;

    var temp2:Vehicle=new Vehicle();
    temp2.parseServerResponse(response.vehicle);
    this.vehicle=temp2;

    var temp3:Company=new Company();
    temp3.parseServerResponse(response.company);
    this.company=temp3;
  }

  extract_response_data(response) {
    console.log("in extract_response_Data");
    this.id = response.id;
    this.company_key = response.company_key;
    this.driver_key = response.driver_key;
    this.date = response.date;
    this.distance = response.total_distance;
    this.time = response.total_time;
    this.notes = response.notes;
  }

	populate_route_items(route_item){

		this.route_items.push(route_item);
	}

	get_number_of_route_items(){
		return this.route_items.length;
	}

}
