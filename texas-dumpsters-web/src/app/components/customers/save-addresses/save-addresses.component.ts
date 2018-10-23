import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { isNullOrUndefined} from "util";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { Customer } from "../../../model/customer";
import { CompaniesService } from '../../../services/companies/companies.service';
import { CustomerService } from '../../../services/customer/customer.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-save-addresses',
  templateUrl: './save-addresses.component.html',
  styleUrls: ['./save-addresses.component.css']
})
export class SaveAddressesComponent implements OnInit {

	@Output() reloadData = new EventEmitter();
	private address;
	private title;
	private customerId;
	//add Address modal
	private addressModal = new EventEmitter<string|MaterializeAction>();
	//add Address toasts
	private addAddressToast = new EventEmitter<string|MaterializeAction>();
  private addAddressToastError = new EventEmitter<string|MaterializeAction>();

  constructor(private authService:AuthService, private customerService:CustomerService) {
		this.address = {};
	}

  ngOnInit() {
  }

	/** save Address function **/
	saveAddress(){
		this.customerService.addAddress(this.address).then(res =>{
			this.closeAddressModal();
			if(res != null){
				this.addAddressToast.emit('toast');
				this.reloadData.emit();
			}else{
				this.addAddressToastError.emit('toast');
			};
		});
	}

	/** edit Address function **/
	deleteAddress(data){
		this.address = data;
		this.address.active = false;
		this.saveAddress();
	}
	
	/** edit Address function **/
	editAddress(data){
		this.title = "Edit Service Address";
		this.address = data;
		this.openAddressModal();
	}

	/** add Address function **/
	addAddress(customer){
		this.title = "Add Service Address to " + customer.customer_name;
		this.address = {};
		this.address.customer_key = customer.id;
		this.openAddressModal();
	}

	/** modals functions **/
	openAddressModal() {
    this.addressModal.emit({action:"modal",params:['open']});
  }
  closeAddressModal() {
    this.addressModal.emit({action:"modal",params:['close']});
  }

}
