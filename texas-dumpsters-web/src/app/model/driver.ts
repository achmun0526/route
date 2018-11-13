import {ServerEntity} from '../common/server_entity';

export class Driver extends ServerEntity {

    id = '';
    company_key = '';
    user_key = '';
    driver_name = '';
    driver_email = '';
    driver_phone = '';
    driver_id = '';
    driver_operational = '';
    active = true;

    constructor() {
        super();
    }
}
