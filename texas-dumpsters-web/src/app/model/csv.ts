import { ServerEntity} from "../common/server_entity";

export class Csv extends ServerEntity{
	
	constructor(){
    super();
  }

	entity:  string='';
	company_key:  string='';
	file: string='';

}