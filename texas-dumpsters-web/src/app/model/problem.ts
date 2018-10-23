import { ServerEntity} from "../common/server_entity";

export class Problem extends ServerEntity{

	constructor(){
        super();
    }
    id: string = "";
    problem_datetime: Date = new Date();
    state:number=0;
    description:string=""
}
