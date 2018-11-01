import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { isNullOrUndefined} from "util";

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent extends BaseComponent implements OnInit {

	menuopen;
	openMenu;
	lateralmenu;
	private logo_url=this.ASSETS+'/default-logo.png';
  constructor(private authService:AuthService, private router:Router, activRoute:ActivatedRoute) {
    super(activRoute);
		this.menuopen = true;
	}

  ngOnInit() {
    console.log("starting up the side nave");
    // debugger;
		$(".button-collapse").sideNav();
    this.authService.getUserProfile().then(user =>{
      this.lateralmenu = this.authService.getUserMenu();
      var width =  window.innerWidth;
      if(width < 720){
        this.menuopen = false;
        this.openMenu = true;
      }
      this.refreshLogoMenu();
    })
    .catch(err => console.log('error: %s', err));
    console.log("done logging side nav errors");
  }

  refreshLogoMenu(){
    this.logo_url=this.ASSETS+'/default-logo.png';
    if (!isNullOrUndefined(this.authService.getCurrentSelectedCompany())){
      if (!isNullOrUndefined(this.authService.getCurrentSelectedCompany().logo_url) &&
        this.authService.getCurrentSelectedCompany().logo_url!=''){
        this.logo_url=this.authService.getCurrentSelectedCompany().logo_url.toString();
      }
    }
		var logoSize = $('#logo-menu');
		var height = logoSize.height();
		var width = logoSize.width();
		if(height >= width){
			logoSize.css({
				"height":'auto',
				"width":'100%'
			})
		}else{
			logoSize.css({
				"height":'auto',
				"width":'100%'
			})
		}
  }

	/*Name : changePage function*/
	/*Date : 01/03/2017 */
	/*Description : function to make te change page
		1. Validate the position in the json
		2. change the page.
	*/
	changePage(i,e){
		this.router.navigate([this.lateralmenu[i].dropdown[e].url]);
		var width =  window.innerWidth;
		if(!this.menuopen){
			for(let item of this.lateralmenu){
			item.open = false;
			}
		}
	}

	/*Name : dropdownMenu function*/
	/*Date : 01/03/2017 */
	/*Description : function to display de submenu
		1. Validate the stage "open"
		2. display or hide the submenu
	*/
	activeMenu;
	dropdownMenu(i){
		if(this.activeMenu == i && this.lateralmenu[i].open == false){
			this.lateralmenu[i].open = true;
		}else if(this.activeMenu == i && this.lateralmenu[i].open == true){
			this.lateralmenu[i].open = false;
		}
		else{
			for(let item of this.lateralmenu){
			 item.open = false;
			}
			if(this.lateralmenu[i].open){
				this.lateralmenu[i].open = false;
			}else{
				this.lateralmenu[i].open = true;
			}
		}
		this.activeMenu = i;
	}


}
