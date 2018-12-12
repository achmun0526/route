import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { AuthService } from '../../../services/auth/auth.service';
import { BaseComponent} from "../../../common/base-component";
import { Router, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-regular-signin',
  templateUrl: './regular-signin.component.html',
  styleUrls: ['./regular-signin.component.css']
})
export class RegularSigninComponent extends BaseComponent implements OnInit {

  user;
  valid;

  @Output() afterAddCompleted = new EventEmitter();
  @Output() onCancelAction = new EventEmitter();

  private addUserToast = new EventEmitter<string|MaterializeAction>();
  private addUserToastError = new EventEmitter<string|MaterializeAction>();


  // add signinModal

  constructor(private authService: AuthService, private router:Router,route: ActivatedRoute){
		super(route);
    this.user= {
      email:"",
      password:""
    }
    this.valid = {
      error:false,
      errorMess:""
    }
  }

  ngOnInit() {
    super.ngOnInit();
  }

  /*Name : singIn function*/
  /*Date : 12/20/2016 */
  /*Description : function to make the singin
    1. Validate the input
    2. Call to the service.
    3. Processing the request and update the UI
  */
  signIn(form){
  // debugger;
  console.log("doing sign in");
  this.doSignIn(form.value.email,form.value.password);
  }


  private doSignIn(email:string,password:string){
    // debugger;
    console.log("doing the sign in");
    this.authService.signIn(email,password).then(user=> {
      if(user!=null){
        window.location.href = (user.roles.indexOf(this.ROLE_NAMES.DRIVER)) > -1 ? '/management/routes' : '/dashboard';
      }
    });
  }

  onCloseClicked(){
  this.onCancelAction.emit();
  }

}
