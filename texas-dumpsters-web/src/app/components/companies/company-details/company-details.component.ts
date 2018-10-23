import { Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { Router, ActivatedRoute, Params} from '@angular/router';
import { CompaniesService } from '../../../services/companies/companies.service';
import { PAGE_SIZE} from '../../../common/app-conf';
import 'rxjs/add/operator/switchMap';
import { BaseComponent} from "../../../common/base-component";
import { AuthService} from "../../../services/auth/auth.service";
import { isNullOrUndefined} from "util";
import { SaveUserComponent} from "../../users/save-user/save-user.component";
import { CompanyModalComponent} from "../company-modal/company-modal.component";
import { SavePricingComponent} from "../save-pricing/save-pricing.component";
import { Company} from "../../../model/company";
import {User} from "../../../model/user";

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent extends BaseComponent implements OnInit {

	userList = [];

	private user;
	private selectedUser:User=null;
	private pageInfo = {page:1,page_size:PAGE_SIZE};
	private selectedCompany:Company=null;
  private addUserModal = new EventEmitter<string|MaterializeAction>();
  private editUserModal = new EventEmitter<string|MaterializeAction>();
	private pricingList = [];
	private pricingTotal;
	//delete user toast
  private deleteUserToast = new EventEmitter<string|MaterializeAction>();
  private deleteUserToastError = new EventEmitter<string|MaterializeAction>();
	// edit company modal
  private companyId;

	@ViewChild(CompanyModalComponent) companyModal:CompanyModalComponent;
	//add service pricing modal
	@ViewChild(SavePricingComponent) pricingModal:SavePricingComponent;

	constructor(activatedRoute: ActivatedRoute,private companiesService: CompaniesService,private authService:AuthService) {
    super(activatedRoute);
		this.user = {};
	}

	ngOnInit() {
    super.ngOnInit();
    this.activatedRoute.params.switchMap((params: Params) => new Promise((resolve, reject) => {
			var companyId=this.authService.getCurrentSelectedCompany().id;
      if (!isNullOrUndefined(params['id'])){
        if (params['id']!='current'){
          companyId=params['id'];
        }
      }
      resolve(companyId);
    })).
				subscribe((companyId) => {
        this.companyId=companyId;
        this.loadCompanyData();
			});
   }

	/** Get company data**/
  loadCompanyData(){
    this.companiesService.getCompanyById(this.companyId).then(company=>{
      this.selectedCompany = company;
			this.getUsers();
			console.log(this.selectedCompany);
    })
	}

	/** edit price function **/
	editPrice(i){
		this.pricingModal.editPrice(this.selectedCompany,i);
	}
	/** add price function **/
	addPrice(){
		this.pricingModal.addPrice(this.selectedCompany.service_pricing,this.selectedCompany);
	}
	/** add price function **/
	deletePrice(i){
		this.pricingModal.deletePrice(this.selectedCompany,i);
	}

	/** delete user function **/
	deleteUser(data){
		this.user = data;
		this.companiesService.deleteUser(this.user.id).then(res=>{
			if(res != null){
				this.deleteUserToast.emit('toast');
			}else{
				this.deleteUserToastError.emit('toast');
			}
			this.getUsers();
		});
	}

	/** list users function **/
	getUsers(){
	  this.userList=[];
		this.authService.getUsersByCompanyId(this.pageInfo,this.selectedCompany.id).then(response=>{
			this.userList=response.records;
		});
	}
	/** list users function **/
	getPricing(){
		this.companiesService.getAllPricing(this.selectedCompany.id,this.pageInfo).then(res=>{
			this.pricingList=res.records
			this.pricingTotal=res.total_records
		});
	}

	openEditUserModal(user){
		this.selectedUser = user;
		setTimeout(() => {
      this.editUserModal.emit({action:'modal',params:['open']});
    }, 100);

  }

	onEditCancelled(){
    this.selectedUser=null;
    this.editUserModal.emit({action:'modal',params:['close']});
  }

	/** change page users function **/
	changePage(page) {
    this.pageInfo.page = page+1;
    this.getUsers();
  }

  onUserCreated(){
    this.addUserModal.emit({action:'modal',params:['close']});
    this.getUsers();
  }

  onUserEdited(){
    this.editUserModal.emit({action:'modal',params:['close']});
    this.getUsers();
  }

	/** edit company function **/
	editCompany(){
		this.companyModal.editCompany(this.selectedCompany);
	}
}
