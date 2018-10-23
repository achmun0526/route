import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Notification } from '../../model/notification';
import { SUCCESS, NOTIFICATIONS_URL } from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";

@Injectable()
export class NotificationService extends BaseService{

    constructor(private http: Http,private authService:AuthService) {
		super();
    }

    getNotificationsByUser(user_key, optimized):Promise<Notification[]> {
      super.showSpinner();
      var params='?' +
      'user_key=' + user_key +
      '&notification_status=unread' +
      ( (optimized!=null)? "&optimized="+optimized : "" );
      return this.http.get(NOTIFICATIONS_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
            if(res.response.records.length > 0){
              return res.response.records;
            }else{
              return [];
            }            
          }else{
            return [];
          }})
      .catch(this.handleError);
    }

    createNotification(notification):Promise<PaginationResponse> {
      super.showSpinner();
      return this.http.post(NOTIFICATIONS_URL , notification).toPromise()
          .then(response => {
              super.hideSpinner();
              var res=response.json();
              if (res.status===SUCCESS){
                return res.response.id;
              }else{
                return null;
          }})
          .catch(this.handleError);
    }

}