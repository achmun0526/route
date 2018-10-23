import { ServerEntity} from "../common/server_entity";

export class Incident extends ServerEntity{

	constructor(){
    super();
  }
		id: string = "";
		driver : any={} ;
    status : string="" ;
    incident_type : string="" ;
    route : string="" ;
    report_datetime: Date = new Date();
    incident_notes : string="" ;
		order_id: string="";
		service_ticket_id: string="";
		order_canceled: string="";
		created_at: Date = new Date();
}
