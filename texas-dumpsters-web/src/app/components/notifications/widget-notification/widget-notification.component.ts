//core
import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeAction } from "angular2-materialize";
import { PAGE_SIZE } from '../../../common/app-conf';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { Utils } from "../../../common/utils";
//components
import { BaseComponent } from "../../../common/base-component";
//services
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notifications/notifications.service';
//models
import { User } from '../../../model/user';

@Component({
  selector: 'app-widget-notification',
  templateUrl: './widget-notification.component.html',
  styleUrls: ['./widget-notification.component.css']
})

export class WidgetNotificationComponent extends BaseComponent implements OnInit {

    private user:User = null;
    private notificationList = [];
    private totalNotifications = 0;

    constructor(private router:Router, private notificationService:NotificationService, private route: ActivatedRoute, private authService:AuthService) {
		super(route);
	}

    ngOnInit() {
        super.ngOnInit();
        this.authService.getUserProfile().then(response =>{
          if (response!=null){
            this.user = this.authService.getCurrentUser();
            this.getNotifications();
            this.hideNotifications();
          }
        });

    }

    /**
     *
     * */
    getNotifications(){
        this.notificationService.getNotificationsByUser(this.user.user_key, true).then(res => {
            this.notificationList = res;
            this.totalNotifications = res.length;
        });
    }

    showNotifications(){
        $(".notification-list").show();
    }

    hideNotifications(){
        $(".notification-list").hide();
    }


    /** this method marks notification as read and redirect to its details */
    goToNotificationDetail(notificationToGo){
        notificationToGo.notification_status = "read";

        //the name is create but for edit works too
        this.notificationService.createNotification(notificationToGo).then(res =>{
            this.getNotifications();
            if(res != null){
                switch(notificationToGo.notification_type){
                    case "Message": {
                        var notificationId = notificationToGo.notification_params;
                        this.router.navigate(["/management/messages", notificationId]);
                    } break;
                }
            }
        });
    }
}
