//core
import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeAction } from "angular2-materialize";
import { PAGE_SIZE } from '../../../common/app-conf';
import { Router, ActivatedRoute, Route } from '@angular/router';
import { Utils } from "../../../common/utils";
//components
import { BaseComponent } from "../../../common/base-component";
import { SaveMessageComponent } from "../save-message/save-message.component";
//sservices
import { MessagesService } from '../../../services/messages/messages.service';
import { AuthService } from '../../../services/auth/auth.service';
//models
import { Message } from '../../../model/message';
import { User } from '../../../model/user';



@Component({
  selector: 'app-administrator-message',
  templateUrl: './administrator-message.component.html',
  styleUrls: ['./administrator-message.component.css']
})
export class AdministratorMessageComponent extends BaseComponent implements OnInit {

	private selectedCompany;
	private pageInfo = { page:1, page_size:PAGE_SIZE };
  private sentMessageList = [];
  private totalSentMessages = 0;
  private receivedMessageList = [];
  private totalReceivedMessages = 0;
  private message:Message;                //new
  private messageToReply:Message = null;  //reply
  private messageToEdit:Message = null;   //edit
  //Delete message toasts
  private deleteMessageToast = new EventEmitter<string|MaterializeAction>();
  private deleteMessageToastError = new EventEmitter<string|MaterializeAction>();

  private addMessageModal = new EventEmitter<string|MaterializeAction>();
  private replyMessageModal = new EventEmitter<string|MaterializeAction>();
  private editMessageModal = new EventEmitter<string|MaterializeAction>();
  private user:User;

  constructor(private router:Router, private messagesService:MessagesService, private route: ActivatedRoute, private authService:AuthService) {
		super(route);
	}

  ngOnInit() {
    super.ngOnInit();
    this.user = this.authService.getCurrentUser();
    this.getMessages();

  }

  getMessages(){
    this.getAllSentMessages();
    this.getAllReceivedMessages();
  }

  /** get Messages **/
	getAllSentMessages(){
		this.messagesService.getAllSentMessagesByUser(this.pageInfo, this.user.user_key).then(res =>{
      this.sentMessageList = res.records;
      this.totalSentMessages= res.total_records;
		});
  }
  getAllReceivedMessages(){
    this.messagesService.getAllReceivedMessagesByUser(this.pageInfo, this.user.user_key).then(res =>{
      this.receivedMessageList = res.records;
      this.totalReceivedMessages = res.total_records;
    });
  }

  /***
   * Deletes the selected message
   *
   * **/
  deleteMessage(selectedMessage){
    this.messagesService.deleteMessage(selectedMessage.id).then(res =>{
      if(res != null){
        this.deleteMessageToast.emit('toast');
        this.pageInfo.page=1;
        this.getMessages();
      }else{
        this.deleteMessageToastError.emit('toast');
      }
    });
  }

	/** Load data of new page **/
	changePage(page) {
    this.pageInfo.page = page + 1;
    this.getMessages();
  }

  onMessageUpdated(){
    this.editMessageModal.emit({action:'modal',params:['close']});
    this.messageToEdit = null;
    this.getMessages();
  }
  onMessageReplyed(){
    this.replyMessageModal.emit({action:'modal',params:['close']});
    this.messageToReply = null;
    this.getMessages();
  }
  onMessageCreated(){
    this.addMessageModal.emit({action:'modal',params:['close']});
    this.message = null;
    this.getMessages();
  }

  onEditCancelled(){
    this.message=null;
    this.editMessageModal.emit({action:'modal',params:['close']});
  }
  onReplyCancelled(){
    this.messageToReply = null;
    this.replyMessageModal.emit({action:'modal',params:['close']});
  }
  onAddCancelled(){
    this.message = null;
    this.addMessageModal.emit({action:'modal',params:['close']});
  }

  /**
   * Open reply modal
   */
  openReplyMessageModal(messageToReply){
    this.messageToReply = messageToReply;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.replyMessageModal.emit({action:'modal',params:['open']});
    }, 100);
  }
  openNewMessageModal(){
    this.message = new Message();
    setTimeout(() => {
      this.addMessageModal.emit({action:'modal',params:['open']});
    }, 100);
  }
  openEditMessageModal(messageToEdit){
    this.messageToEdit=messageToEdit;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.editMessageModal.emit({action:'modal',params:['open']});
    }, 100);
  }


  /** Go to details of the message **/
	goToMessageThread(data){
		this.router.navigate(["/management/messages", data.id]);
	}

}
