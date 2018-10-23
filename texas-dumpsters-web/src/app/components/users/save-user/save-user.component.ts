import { Component, OnInit, EventEmitter, ViewChild, Output, Input , OnChanges} from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { isNullOrUndefined} from "util";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { CompaniesService } from '../../../services/companies/companies.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ROLES, ROLE_NAMES} from "../../../common/app-conf";
import { Utils} from "../../../common/utils";
import { Form} from "@angular/forms";
import { ActivatedRoute} from "@angular/router";
import { BaseComponent} from "../../../common/base-component";
import { Styles } from "../../../common/styles";

@Component({
  selector: 'app-save-user',
  templateUrl: './save-user.component.html',
  styleUrls: ['./save-user.component.css']
})
export class SaveUserComponent extends BaseComponent implements OnInit, OnChanges {


  //Indicates the default company to tie the user
  @Input() selectedCompany;
  //This parameter is used when the component is used on edit mode
  @Input() userToEdit;

  @Output() afterAddCompleted = new EventEmitter();
  @Output() onCancelAction = new EventEmitter();

  private user;
  private title="Add User";
  private updateProfileMode=false;
  private selectCompanyAllowed=true;
  private previousEmail = ""; //this is for not save same email twice

  //add user toast
  private addUserToast = new EventEmitter<string|MaterializeAction>();
  private addUserToastError = new EventEmitter<string|MaterializeAction>();

  private validations={role_valid:true,company_valid:true,email_valid:true};

  constructor(private companiesService:CompaniesService, private authService:AuthService, activatedRoute:ActivatedRoute) {
    super(activatedRoute);
    this.user = {};
  }

  private roles=[];
  private companies=[];

  ngOnInit() {
    this.setupEdit();
  }
	ngOnChanges(userToEdit) {
    this.setupEdit();
  }

  setupEdit(){
    this.authService.getAuthorizedRolesToGrant().then(response=>this.roles=response);
    this.companiesService.getCompaniesByUser(null).then(response=>{
      this.companies=JSON.parse(response);
      //This means the component is not being called inside a company so we find the current selected company
      if(isNullOrUndefined(this.selectedCompany)){
        this.selectedCompany=this.authService.getCurrentSelectedCompany();
        if (!this.authService.getCurrentUser().hasAdminRole()){
          this.selectCompanyAllowed=false;
        }
      }else{
        //This means the component is calle inside a company so we can't change the company
        this.selectCompanyAllowed=false;
      }
      this.user.company_key=this.selectedCompany.id;
      if(!isNullOrUndefined(this.userToEdit)){
        this.selectCompanyAllowed=false;
        this.user = this.userToEdit;
        this.previousEmail = this.user.email;
        this.title="Edit User";
        this.user.role = this.userToEdit.getUserRole();
        if (!isNullOrUndefined(this.userToEdit.company)){
          this.user.company_key=this.userToEdit.company.id;
        }
        //THIS MEANS THE USER IS UPDATING ITS OWN PROFILE
        if (this.userToEdit.user_key===this.authService.getCurrentUser().user_key){
          this.title="Update Profile";
          this.updateProfileMode=true;
        }
      }
      // fix dropdown heigh
      Styles.fixDropDownHeigh("smallDropdown", 5);
    });
  }

  /**
   * Saves the user on the backend
   *
   * */
  saveUser(){
    /*if(this.previousEmail != this.user.email){  //if email has changed then validate
      this.emailValidation();
    }
    this.validations.role_valid = Utils.isValidDropdown(this.user.role);
    if (this.selectCompanyAllowed){
      this.validations.company_valid = Utils.isValidDropdown(this.user.company_key);
    }
    if(!this.validations.role_valid || !this.validations.email_valid || !this.validations.company_valid){
      return;
    }*/

    this.validateFields();

    if(!this.validations.role_valid || !this.validations.company_valid){
      return;
    }

    this.authService.signUp(this.user).then(res=>{
      if(res == true){
        this.addUserToast.emit('toast');
      }else{
        this.addUserToastError.emit('toast');
      }
      this.afterAddCompleted.emit();
      this.user ={};
    });
  }

  validateFields(){
    if(this.user.role=='0' || isNullOrUndefined(this.user.role)){
      this.validations.role_valid = false;
    }else{
      this.validations.role_valid = true;
    }

    if(this. user.company_key == '0' || isNullOrUndefined(this.user.company_key)){
      this.validations.company_valid = false;
    }else{
      this.validations.company_valid == true;
    }
  }

  onCloseClicked(){
    this.onCancelAction.emit();
  }

	private changeDesk(ev){
		this.user.contact_phone_desk = ev;
	}
	private changeMobile(ev){
		this.user.contact_phone_mobile = ev;
	}


	emailValidation(){
	  if (!this.updateProfileMode){
      if(this.user.email != ""){
        this.authService.validateEmail(this.user.email).then(isValid => this.validations.email_valid = isValid);
      }
    }
  }
}
