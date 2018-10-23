//Core
import { Component, OnInit, EventEmitter, ViewChild, Output, Input , OnChanges } from '@angular/core';
import { MaterializeDirective, MaterializeAction } from "angular2-materialize";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { ROLES, ROLE_NAMES } from "../../../common/app-conf";
import { Utils } from "../../../common/utils";
import { Form } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { isNullOrUndefined } from "util";
//Components
import { BaseComponent } from "../../../common/base-component";
//Services
import { CompaniesService } from '../../../services/companies/companies.service';
import { AuthService } from '../../../services/auth/auth.service';
import { SMSService } from "../../../services/sms/sms.service";
import { MessagesService } from "../../../services/messages/messages.service";
//models
import { Message } from "../../../model/message";
import { User } from "../../../model/user";

@Component({
  selector: 'app-send-sms',
  templateUrl: './send-sms.component.html',
  styleUrls: ['./send-sms.component.css']
})
export class SendSMSComponent extends BaseComponent implements OnInit, OnChanges {

  @Input() userToSend;

  @Output() afterSMSsent = new EventEmitter();
  @Output() onCancelAction = new EventEmitter();

  public message: string;
  public blockSubmit: boolean ;
  private senderUser:User;

  private roles=[];
  private companies=[];

  private add_SMS_Toast = new EventEmitter<string|MaterializeAction>();
  private add_SMS_ToastError = new EventEmitter<string|MaterializeAction>();  

  constructor(private authService:AuthService, activatedRoute:ActivatedRoute, private smsService: SMSService, private messagesService: MessagesService) {
    super(activatedRoute);
    this.message = "";
    this.senderUser = this.authService.getCurrentUser();
  }

  ngOnInit() {
  }

  ngOnChanges(userToEdit) {

  }

  send(){
      this.blockSubmit = true;
      var messageToSend = {
        message:this.message, 
        driver_key: this.userToSend.user_key
      }
      this.smsService.sendSMS(messageToSend)
        .then( result => {
          this.blockSubmit = false;
          this.add_SMS_Toast.emit('toast');
          this.afterSMSsent.emit();       
        });
  }

  close(){
    this.message = "";
    this.onCancelAction.emit();
  }

}
