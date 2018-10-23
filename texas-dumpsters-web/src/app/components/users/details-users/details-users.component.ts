import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { AuthService } from '../../../services/auth/auth.service';
import { User} from "../../../model/user";

@Component({
  selector: 'app-details-users',
  templateUrl: './details-users.component.html',
  styleUrls: ['./details-users.component.css']
})
export class DetailsUsersComponent extends BaseComponent implements OnInit {

	private user;

	constructor(activatedRoute: ActivatedRoute, private authService:AuthService) {
		super(activatedRoute);
		this.user ={
			role:[]
		};
	}

  ngOnInit() {
		super.ngOnInit();

		this.activatedRoute.params.switchMap((params: Params) => this.authService.getUserByEmail(params['email'])).
				subscribe((userRes:User) => {
			this.user = userRes;
		});

  }

}
