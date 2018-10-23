import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MaterializeDirective, MaterializeAction } from "angular2-materialize";
import { ROLE_NAMES, PAGE_SIZE } from "../../../common/app-conf";
import { BaseComponent } from "../../../common/base-component";
import { ActivatedRoute } from "@angular/router";

import { AuthService } from '../../../services/auth/auth.service';
import { MessagesService}  from '../../../services/messages/messages.service';
import { NotificationService}  from '../../../services/notifications/notifications.service';

import { Message } from '../../../model/message';
import { User } from '../../../model/user';
import { Notification } from '../../../model/notification';

import { Utils } from "../../../common/utils";
import { Styles } from "../../../common/styles";

@Component({
	selector: 'app-save-message',
	templateUrl: './save-message.component.html',
	styleUrls: ['./save-message.component.css']
})
export class SaveMessageComponent extends BaseComponent implements OnInit {

	//This parameter is used when the component is used on edit mode
	@Input() messageToEdit;
	@Input() messageToReply;
	@Input() userToSend;
	@Output() afterSaveCompleted = new EventEmitter();
	@Output() onCancelAction = new EventEmitter();

	private message:Message = new Message() ;
	private senderUser:User;
	private title = "";
	private mode="ADD";
	private date;
	private userList = [];
	private pageInfo = { page:1, page_size:PAGE_SIZE };
	private selectedCompany;
	private roles=[];
	private filterRol = null;

	private totalUsers = 0;

	//add message modal
	private messageModal = new EventEmitter<string|MaterializeAction>();
	//add message toasts
	private addMessageToast = new EventEmitter<string|MaterializeAction>();
	private addMessageToastError = new EventEmitter<string|MaterializeAction>();

	private validations={message_valid:true, driver_valid:true};

	constructor(activatedRoute:ActivatedRoute,private messagesService:MessagesService, private authService:AuthService, private notificationService:NotificationService) {
		super(activatedRoute);
		this.senderUser = this.authService.getCurrentUser();
		this.selectedCompany = this.authService.getCurrentSelectedCompany();
	}

	ngOnInit() {
		if ( !this.isNullOrUndefined(this.messageToEdit) ){
			this.setupEdit();
		}else if( !this.isNullOrUndefined(this.messageToReply) ){
			this.setupReply();
		}
		else if( !this.isNullOrUndefined(this.userToSend)){
			this.setupCreateToUser();
		}
		else{
			this.setupCreateEmpty();
		}
	}

	/**
	 *
	 * */

	setupReply(){
		this.title	= "Reply message";
		this.mode 	= 'REPLY';

		this.message.sender_user_key 	= this.senderUser.user_key;
		this.message.receiver_user_key 	= this.messageToReply.sender_user_key;

		if(this.message.receiver_user_key == this.senderUser.user_key){ // if is the same user chage for the other
			this.message.receiver_user_key = this.messageToReply.receiver_user_key;
		}

		this.message.message_title 		= "Re: " + this.messageToReply.message_title;
		this.message.parent_message_key = this.messageToReply.id;
		this.message.company_key 		= this.selectedCompany.id;

		this.message.active 			= true;
		this.message.date 				= new Date();
		this.message.message_type 		= "INTERNAL";
		this.message.message_status 	= "ACTIVE";
	}

	setupEdit(){
		this.title = "Edit Messagge";
		this.mode='EDIT';
		this.message=this.messageToEdit;
	}

	setupCreateToUser(){
		this.title = "Send message to user";
		this.mode = "ADD_TO_USER"
		this.message = new Message();
		this.message.receiver_user_key = this.userToSend.user_key;
		this.message.parent_message_key = null; //its new, has no parent
		this.message.company_key = this.selectedCompany.id;
		this.message.sender_user_key = this.senderUser.user_key;
		this.message.active = true;
		this.message.date = new Date();
		this.message.message_type = "INTERNAL";
		this.message.message_status = "ACTIVE";
	}

	setupCreateEmpty(){
		this.authService.getAuthorizedRolesToGrant().then(response=>{
			this.roles=response
			Styles.fixDropDownHeigh("smallDropdown", 5);
		});
		this.message = new Message();
		this.title = "Add Message";
		this.mode = 'ADD_EMPTY';
		this.message.parent_message_key = null; //its new, has no parent
		this.message.company_key = this.selectedCompany.id;
		this.message.sender_user_key = this.senderUser.user_key;
		this.message.active = true;
		this.message.date = new Date();
		this.message.message_type = "INTERNAL";
		this.message.message_status = "ACTIVE";
		this.getCompanyUsers();
	}

	/** save Routes function **/
	saveMessage(){
	  	if (!this.validations.message_valid){
			return;
		}
		//prepage message
		switch(this.mode){
			case 'ADD_TO_USER':{
			} break;
			case 'ADD_EMPTY':{
			} break;
			case 'EDIT': {
			} break;
			case 'REPLY': {

			} break;
		}

		// save message
		this.messagesService.addMessage(this.message).then(res =>{
			if(res != null){
				var idMess = res;
				this.createMessageNotification(idMess);
				this.ngOnInit();
				this.addMessageToast.emit('toast');
				this.afterSaveCompleted.emit();
			}else{
				this.addMessageToastError.emit('toast');
			}
		});
	}

	userChanged(){
		console.log("receiver", this.message.receiver_user_key);
	}

	getDrivers(){
		this.authService.getUsersByRole(ROLE_NAMES.DRIVER, true).then(res=>{
			this.userList = res.records;
			Styles.fixDropDownHeigh("smallDropdown", 5);
		});
	}

	getCompanyUsers(){
		var company = this.authService.getCurrentSelectedCompany();
		this.authService.getUsersByCompanyId(this.pageInfo, company.id).then(res =>{
			this.userList = res.records;
			Styles.fixDropDownHeigh("smallDropdown", 5);
		});
	}

	filterUsersByRol(){
		$(".spinnerImg").show();

		this.totalUsers = 0;
		$(".usersDD").remove();

		this.authService.getUsersByRole(this.filterRol, true).then(res=>{
			$(".spinnerImg").hide();
			this.userList = res.records;
			this.totalUsers = this.userList.length;
			Styles.fixDropDownHeigh("smallDropdown", 5);
		})
	}

	createMessageNotification(idMessage){
		var notitificationTitle="";
		switch(this.mode){
			case 'ADD_TO_USER':{
				notitificationTitle = "Message from: " + this.senderUser.email;
			} break;
			case 'ADD_EMPTY':{
				notitificationTitle = "Message from: " + this.senderUser.email;
			} break;
			case 'EDIT': {
				notitificationTitle = "Message edited from: " + this.senderUser.email;
			} break;
			case 'REPLY': {
				notitificationTitle = "Reply from: " + this.senderUser.email;
			} break;
		}

		//if not delete
		if(this.message.active != false){
			var notification = new Notification();
			notification.company_key = this.selectedCompany.id;
			notification.user_key = this.message.receiver_user_key;
			notification.notification_text = notitificationTitle;
			notification.notification_type = "Message";
			notification.notification_params = idMessage;  //paramenter send is the id of the message
			notification.notification_status = "unread";
			this.notificationService.createNotification(notification).then(res=>{
				console.log("notification created");
			});
		}
	}
}
