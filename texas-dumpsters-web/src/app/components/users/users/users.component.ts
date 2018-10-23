import { Component, OnInit, EventEmitter } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { MaterializeAction} from "angular2-materialize";
import { User} from "../../../model/user";
import { Router, ActivatedRoute} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { PAGE_SIZE} from "../../../common/app-conf";
import { ROLES, ROLE_NAMES} from "../../../common/app-conf";
declare var gapi: any

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent extends BaseComponent implements OnInit {

	private userList:User[]=[];
  private user;
  private currentUser;
  private loadBtn;
  private totalUsers=0;
  private pageInfo = {page:1,page_size:PAGE_SIZE};

  private addUserModal = new EventEmitter<string|MaterializeAction>();
  private editUserModal = new EventEmitter<string|MaterializeAction>();
  private sendSMSModal = new EventEmitter<string|MaterializeAction>();
  private addMessageToUserModal = new EventEmitter<string|MaterializeAction>();
  private selectedUser = null;
  private userToSend:User = null;
  //delete user toast
  private deleteUserToast = new EventEmitter<string|MaterializeAction>();
  private deleteUserToastError = new EventEmitter<string|MaterializeAction>();

 constructor(private router:Router ,route: ActivatedRoute, private authService:AuthService) {
		super(route);
    this.user = {};
	}

  ngOnInit() {
		super.ngOnInit();
    this.getUsers();
    this.showBtn();
  }
  //Determine if user is admin and whether to show add user button
  showBtn() {
    this.currentUser = this.authService.getCurrentUser();
    if(this.currentUser.roles[0] == ROLE_NAMES.ADMIN)
      this.loadBtn = true;
  }

  getBtn() {
    return this.loadBtn;
  }
	/**
   *
   * * list users function
   * **/
	getUsers(){
		this.authService.getAllUsers(this.pageInfo).then(res=>{
      this.userList = res.records;
      this.totalUsers=res.total_records;
      setTimeout(() => {
        for(let i = 0; i < this.totalUsers; i++){
            if(this.userList[i].email){
                gapi.hangout.render('placeholder-div'+i, { 'render': 'createhangout', 'invites': [{'id':this.userList[i].email, 'invite_type':'EMAIL'}], 'widget_size': 72 });
            }
        }
      }, 1000);
		});
	}

  /**
   *
   *
   * */
  openEditUserModal(user){
		//this.UserModal.editUser(user);
    this.selectedUser=user;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.editUserModal.emit({action:'modal',params:['open']});
    }, 100);
  }

  openSMSModal(user){
    this.selectedUser=user;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.sendSMSModal.emit({action:'modal',params:['open']});
    }, 100);
  }

  /**
   *
   * */
	deleteUser(selectedUser){
    this.authService.deleteUser(selectedUser.user_key).then(res=>{
      if (res){
        this.deleteUserToast.emit('toast');
        this.getUsers();
      }else{
        this.deleteUserToastError.emit('toast');
      }
    });
	}

  openAddUserModal(){
    setTimeout(() => {
      this.addUserModal.emit({action:'modal',params:['open']})
    }, 100);
  }

	/**
   *
   * */
  onUserCreated(){
    this.addUserModal.emit({action:'modal',params:['close']});
    this.getUsers();
  }

  /**
   *
   *
   * */
  onUserUpdated(){
    this.editUserModal.emit({action:'modal',params:['close']});
    this.getUsers();
  }

  changePage(page) {
    this.pageInfo.page = page+1;
    this.getUsers();
  }

  /**
   *
   *
   * */
  onEditCancelled(){
    this.selectedUser=null;
    this.editUserModal.emit({action:'modal',params:['close']});
  }

  /**Action triggered after SMS sent */
  onSMSsent(){
    this.sendSMSModal.emit({action:'modal',params:['close']});
    //Other actions like refresh or reload page.
  }

  /*** Action triggered when user clicks on cancel button */
  onSMSCancelled(){
    this.sendSMSModal.emit({action:'modal',params:['close']});
  }

  /**
   *
   *
   * */
  goToUserDetails(data){
		this.router.navigate(["/settings/users_details",data.email]);
	}

  openNewMessageToUserModal(userToSend){
    this.userToSend = userToSend;
    setTimeout(() => {
      this.addMessageToUserModal.emit({action:'modal',params:['open']});
    }, 100);
  }

  onMessageToUserCreated(){
    this.addMessageToUserModal.emit({action:'modal',params:['close']});
    this.userToSend = null;
  }

  onAddMessageToUserCancelled(){
    this.userToSend = null;
    this.addMessageToUserModal.emit({action:'modal',params:['close']});
  }
}

  