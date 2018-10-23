import { Injectable } from '@angular/core';
import { User } from '../../model/user';
import { Http } from '@angular/http';
import { SUCCESS} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";

@Injectable()
export class SMSService extends BaseService{

  constructor(private http: Http) {
		super();
	}
	
	/**
	 * This method calls the server in order to add cvs file
	 *
	 *
	 * */
	sendSMS(data):Promise<string> {
		super.showSpinner();
        return this.http.post('x/a/v1/sms/send_message_to_driver' , data).toPromise()
        .then(response => {
                super.hideSpinner();
                var res=response.json();
                if (res.status===SUCCESS){
                    return res;
                }else{
                    return null;
                }})
        .catch(this.handleError);
  }

}
