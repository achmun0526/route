import {Component, AfterViewInit, ViewChild, EventEmitter} from '@angular/core';
import { AuthService } from './services/auth/auth.service';
import { ASSETS_URL } from "./common/app-conf";
import { CompaniesService } from './services/companies/companies.service';
import { Company} from "./model/company";
import { isNullOrUndefined} from "util";
import { SideNavComponent} from "./components/common/side-nav/side-nav.component";
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[AuthService]
})
export class AppComponent {
  menuopen = true;
  private lateralmenu;
  private loggedUser=null;
  private menuService = false;
	private companiesList = [];
	public selectedCompany:Company=new Company();
  private editUserModal = new EventEmitter<string|MaterializeAction>();
  @ViewChild(SideNavComponent) menuComponent:SideNavComponent;
  perfilImage = ASSETS_URL + "profile-icon.png";

  constructor(private authService: AuthService, private companiesService:CompaniesService) {
  }

  ngOnInit(): void {
    debugger
    this.authService.getUserProfile().then(response =>{
      if (response!=null){

				this.loggedUser = this.authService.getCurrentUser();

				if ( !isNullOrUndefined(this.loggedUser) ){
					if( this.loggedUser.hasAdminRole() ){
						this.getCompanies();
					}else{
						this.selectedCompany = this.loggedUser.company;
						if (this.selectedCompany == null) {
							// todo: @adozier, create a better interface for this error to be fixed...
							alert('Company for user not defined!');
						}
						this.authService.saveCurrentSelectedCompany(this.selectedCompany, true);
					}
				}
      }
      this.menuService = this.authService.isUserSignedIn();
    })
    .catch(err => console.log('Get User Profile Error: %s', err));
  }

	openMenu = false;
  displayMenu(){
		var width =  window.innerWidth;
		if(width < 981){
			this.displaySmall();
		}else{
			this.displayLarger();
		}
  }

	/** get company id **/
	getCompanies(){
		this.companiesService.getCompaniesByUser(null).then(res=>{
      console.log("Logging the response");
      console.log(res);
			this.companiesList = JSON.parse(res);
      console.log(this.companiesList);
      if (this.companiesList.length>0){
				this.authService.saveCurrentSelectedCompany(this.companiesList[0],false);
				this.selectedCompany=this.authService.getCurrentSelectedCompany();
				this.menuComponent.refreshLogoMenu();
			}
		})
    .catch(err => console.log('error: %s', err));
	}


	/**
   *
   *
   **/
  openEditUserModal(){
    this.editUserModal.emit({action:'modal',params:['open']})
  }

	/**
   *
   *
   * */
	changeSelectedCompany(newCompany){
    this.authService.saveCurrentSelectedCompany(newCompany,true);
    this.selectedCompany=newCompany;
    this.menuComponent.refreshLogoMenu();
    window.location.reload();
  }

	displayLarger(){
		if(this.menuopen){
			$( '.lateral-nav').animate({width:"50px"},300);
			$( '.openmenu').animate({paddingLeft:"50px"},300);
			$( '.lateral-nav nav ul li a').animate({paddingLeft:"12px"},300);
			$( '.lateral-nav .image-logo').animate({padding:"3px"},300);
			this.menuopen = false;
		}else{
			$( '.lateral-nav').animate({width:"250px"},300);
			$( '.openmenu').animate({paddingLeft:"250px"},300);
			$( '.lateral-nav nav ul li a').animate({paddingLeft:"30px"},300);
			$( '.lateral-nav .image-logo').animate({padding:"30px"},300);
			this.menuopen = true;
		}
	}
	displaySmall(){
		if(this.menuopen){
				$( '.lateral-nav').animate({width:"50px"},300);
				$( '.openmenu').animate({paddingLeft:"50px"},300);
				$( '#primaryNavbar').animate({paddingLeft:"0px"},300);
				$( '.lateral-nav nav ul li a').animate({paddingLeft:"12px"},300);
				$( '.lateral-nav .image-logo').animate({padding:"3px"},300);
				this.menuopen = false;
				this.openMenu = true;

			}else{
				$( '.lateral-nav').animate({width:"250px"},300);
				$( '.lateral-nav nav ul li a').animate({paddingLeft:"30px"},300);
				$( '#primaryNavbar').animate({paddingLeft:"200px"},300);
				$( '.lateral-nav .image-logo').animate({padding:"30px"},300);
				this.menuopen = true;
				this.openMenu = false;
			}
	}

  /**
   *
   * */
  isNullOrUndefined(param){
    return isNullOrUndefined(param);
  }

}
