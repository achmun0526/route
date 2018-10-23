//core
import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeAction } from "angular2-materialize";
import { PAGE_SIZE } from '../../../common/app-conf';
import { Router, ActivatedRoute, Route, Params } from '@angular/router';
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

declare var $:any;

@Component({
  selector: 'app-thread-message',
  templateUrl: './thread-message.component.html',
  styleUrls: ['./thread-message.component.css']
})
export class ThreadMessageComponent extends BaseComponent implements OnInit {

	private selectedCompany;
  private pageInfo = { page:1, page_size:PAGE_SIZE };
  private parentMessage:Message = null;
  private selectedMessage:Message = null;
  private childMessages:Message[] = [];
  private childMessagesLength = 0;
  private messageToReply:Message = null;
  private messageToEdit:Message = null;
  //Delete message toasts
  private deleteMessageToast = new EventEmitter<string|MaterializeAction>();
  private deleteMessageToastError = new EventEmitter<string|MaterializeAction>();

  private addMessageModal = new EventEmitter<string|MaterializeAction>();
  private editMessageModal = new EventEmitter<string|MaterializeAction>();
  private replyMessageModal = new EventEmitter<string|MaterializeAction>();

  private user:User;

  constructor(private router:Router, private messagesService:MessagesService, private route: ActivatedRoute, private authService:AuthService) {
		super(route);
	}

  ngOnInit() {
    super.ngOnInit();
    this.user = this.authService.getCurrentUser();
    this.getMessageThread();
  }

  /**get Thread of this message**/
	getMessageThread(){
    this.activatedRoute.params.switchMap((params: Params) => this.messagesService.getMessageById(params['id'])).
    subscribe((responseMessage:Message) => {
      this.selectedMessage = responseMessage;
      // If the massage started thread (is parent)
      if(this.isNullOrUndefined(this.selectedMessage.parent_message_key)){
        this.parentMessage = this.selectedMessage;
        this.getMessageChilds(this.parentMessage.id);
      }
      // is not parent
      else{
        this.messagesService.getMessageById(this.selectedMessage.parent_message_key).then(mes => {
          this.parentMessage = mes;
          //get childs
          this.getMessageChilds(this.parentMessage.id);
        });
      }
		});
  }
  
  getMessageChilds(parentId){
    this.messagesService.getMessageChildsByParentId(this.pageInfo, parentId).then(res => {
      this.childMessages = res.records;
      this.childMessagesLength = res.total_records;
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
        this.getMessageThread();
      }else{
        this.deleteMessageToastError.emit('toast');
      }
    });
  }

  /** Load data of new page **/
	changePage(page) {
    this.pageInfo.page = page+1;
    this.getMessageThread();
  }

  openEditMessageModal(messageToEdit){
    this.messageToEdit=messageToEdit;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.editMessageModal.emit({action:'modal',params:['open']});
    }, 100);
  }
  openReplyMessageModal(messageToReply){
    this.messageToReply=messageToReply;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.replyMessageModal.emit({action:'modal',params:['open']});
    }, 100);
  }

  onMessageUpdated(){
    this.editMessageModal.emit({action:'modal',params:['close']});
    this.messageToEdit = null;
    this.getMessageThread();
  }
  onMessageReplyed(){
    this.replyMessageModal.emit({action:'modal',params:['close']});
    this.messageToReply = null;
    this.getMessageThread();
  }

  onEditCancelled(){
    this.messageToEdit=null;
    this.editMessageModal.emit({action:'modal',params:['close']});
  }
  onReplyCancelled(){
    this.messageToReply=null;
    this.replyMessageModal.emit({action:'modal',params:['close']});
  }
}