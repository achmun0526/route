import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { isNullOrUndefined} from "util";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { Customer } from "../../../model/customer";
import { Company } from "../../../model/company";
import { CompaniesService } from '../../../services/companies/companies.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CustomerService } from '../../../services/customer/customer.service';
import { BaseComponent} from "../../../common/base-component";
import { ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-save-customer',
  templateUrl: './save-customer.component.html',
  styleUrls: ['./save-customer.component.css']
})
export class SaveCustomerComponent extends BaseComponent implements OnInit {

	@Input() customerToEdit: Customer = null;
	@Input() child:boolean = false;
	@Output() onSaveCompleted = new EventEmitter();
	@Output() onCancelAction = new EventEmitter();

	private customer;
	private address;
	private serviceAddress;
	private seletedCompany:Company;
	private title = "Customer";
	private companiesList =[];
	private cssClass = '';

	//add customer modal
	private customerModal = new EventEmitter<string|MaterializeAction>();

	//add customer toasts
	private addCustomerToast = new EventEmitter<string|MaterializeAction>();
  	private addCustomerToastError = new EventEmitter<string|MaterializeAction>();
	//delete customer toasts
	private deleteCustomerToast = new EventEmitter<string|MaterializeAction>();
  	private deleteCustomerToastError = new EventEmitter<string|MaterializeAction>();

  	constructor(private authService:AuthService, private customerService:CustomerService,activatedRoute:ActivatedRoute) {
		super(activatedRoute);
    	this.customer = {};
		this.address = {};
		this.serviceAddress = {};
		this.customer.service_addresses = false;
	}

  	ngOnInit() {
		this.seletedCompany = this.authService.getCurrentSelectedCompany();
		if( this.isNullOrUndefined(this.customerToEdit) ){
			this.setupNew();
		}else{
			this.setupEdit();
		}
		if(this.child){
			this.cssClass = "child";
		}
	}

	setupNew(){
		this.title = "Add a Customer to " + this.seletedCompany.name;
		this.customer = {};
		this.customer.active = true;
		this.serviceAddress = {};
		this.customer.company_key = this.seletedCompany.id;
		this.address = {};
		this.customer.service_addresses = false;
	}
	setupEdit(){
		this.title = "Edit Data of " + this.customerToEdit.customer_name;
		this.customer = this.customerToEdit;
		this.customer.active = true;
	}

	/** save customer function **/
	saveCustomer(){
		this.customerService.addCustomer(this.customer).then(res =>{
      this.addCustomerToast.emit('toast');
      this.onSaveCompleted.emit();
			// if(res != null){
			// 	if(this.customer.service_addresses){
			// 		this.saveAddress(res);
			// 	}else{
			// 		this.addCustomerToast.emit('toast');
			// 	}
			// 	this.onSaveCompleted.emit();
			// }else{
			// 	this.addCustomerToastError.emit('toast');
			// }
			// this.cancelAction();
		});
	}

	/** save Address function **/
	saveAddress(data){
		this.address.customer_key = data.response.id;
		this.address.address = data.response.billing_address;
		this.address.zipcode = data.response.billing_zipcode;
		this.address.state = data.response.billing_state;
		this.address.city = data.response.billing_city;
		this.address.notes = data.response.notes;

		this.customerService.addAddress(this.address).then(res =>{
			if(res != null){
				this.addCustomerToast.emit('toast');
			}
		});
	}

	/** delete customer function **/
	deleteCustomer(data){
		this.customer = data;
		this.customer.active = false;

		this.customerService.addCustomer(this.customer).then(res =>{
			if(res != null){
				this.deleteCustomerToast.emit('toast');
				this.onSaveCompleted.emit();
			}else{
				this.deleteCustomerToastError.emit('toast');
			}
		});

	}

  	cancelAction() {
    	// Needs to be cleared for new and edit other
		this.customerToEdit = null;
		this.customer = new Customer();
		this.onCancelAction.emit();
	}

	 //*change phone numeber model update *//
	changePhone(ev){
		this.customer.contact_phone = ev;
	}

}
