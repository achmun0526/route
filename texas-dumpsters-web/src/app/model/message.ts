import { ServerEntity } from "../common/server_entity";
import { User } from "./user";

export class Message extends ServerEntity{

    constructor(){
        super();
    }

    id                  :String = null;
    company_key         :String = null;
    sender_user_key     :String = '';
    receiver_user_key   :String = '';
    message_type        :string = null;
    message_title       :string = null;
    message_body        :string = '';
    message_status      :string = '';
    active              :boolean = false;
    date                :Date = new Date();
    parent_message_key  :string = null;    

    receiver_user       :User = null;
    sender_user         :User = null;
}
