import { Component, OnInit, EventEmitter } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs/Subscription';
import { Router, ActivatedRoute} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { MaterializeAction} from "angular2-materialize";

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  providers:[AuthService]
})
export class SigninComponent extends BaseComponent implements OnInit {
  user;
  valid;
  private sub: Subscription;
  private signinModal = new EventEmitter<string|MaterializeAction>();
  private isGoogle:boolean;
  private regular_sign_in = false;
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
    //IF the user is already validated, we redirect it to the dashboard
    this.authService.getUserProfile().then(user=>{
      if (user!=null){
        window.location.href='/';
        this.router.navigateByUrl('/dashboard');
      }
    });
  }


  openSigninModal(){
    setTimeout(() => {
      this.signinModal.emit({action:'modal',params:['open']})
    }, 100);
  }
}