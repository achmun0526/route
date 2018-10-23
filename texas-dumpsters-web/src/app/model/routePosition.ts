import { ServerEntity} from "../common/server_entity";

export class RoutePosition extends ServerEntity{
    constructor(){
        super();
    }

    route_key: string ='';
    latitude: string = '';
    longitude: string = '';
}