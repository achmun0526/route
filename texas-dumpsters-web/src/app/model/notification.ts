import { ServerEntity } from "../common/server_entity";

export class Notification extends ServerEntity{
    constructor(){
        super();
    }

    id                  :String = null;
    company_key         :String = null;
    user_key            :String = null;
    notification_type   :String = null;
    notification_text   :String = null;
    notification_params :String = null;
    notification_status :String = 'unread';
    date                :Date   = null;

}