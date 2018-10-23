import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { SaveAddressesComponent} from '../save-addresses/save-addresses.component';
import { SaveCustomerComponent} from '../save-customer/save-customer.component';
import { PAGE_SIZE} from '../../../common/app-conf';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { CustomerService } from '../../../services/customer/customer.service';
import { BaseComponent} from "../../../common/base-component";
import { isNullOrUndefined} from "util";
import { Customer} from "../../../model/customer";

@Component({
  selector: 'app-details-customer',
  templateUrl: './details-customer.component.html',
  styleUrls: ['./details-customer.component.css']
})
export class DetailsCustomerComponent extends BaseComponent implements OnInit {

	private customer;
	private customerToEdit:Customer = null;
	private totalAddress;
	private addressList = [];
	private pageInfo = {page:1,page_size:PAGE_SIZE};

	private editCustomerModal = new EventEmitter<string|MaterializeAction>();

	// address modal
	@ViewChild(SaveAddressesComponent) addressModal:SaveAddressesComponent;

  	constructor(private router:Router ,activatedRoute: ActivatedRoute,private customerService:CustomerService) {
		super(activatedRoute);
		this.customer = {};
	}

	ngOnInit() {
		super.ngOnInit();
		this.getCustomer();
	}

	getCustomer(){
		this.activatedRoute.params.switchMap((params: Params) => this.customerService.getCustomerById(params['id'])).
			subscribe((customerRes:Customer) => {
			this.customer = {};
			this.customer=customerRes;
			this.getAddresses();
		});
	}

	ngOnChanges() {

	}

	/** open modal to edit current customer **/
	openEditCustomerModal(customerToEdit){
		this.customerToEdit = customerToEdit;
		setTimeout(() => {
			this.editCustomerModal.emit({action:'modal',params:['open']});
		  }, 100);
	}

	onCustomerEdited(){
		this.customerToEdit = null;
		this.getCustomer();
	}

	onEditCancelled(){
		this.customerToEdit = null;
		this.editCustomerModal.emit({action:'modal',params:['close']});
	}

	/** get address list**/
	getAddresses(){
		this.customerService.getAllAddress(this.customer.id,this.pageInfo).then(res=>{
			this.addressList = res.records;
			this.totalAddress= res.total_records;
		});
	}

	/** open modal to edit a service address **/
	editAddress(data){
		this.addressModal.editAddress(data);
	}

	/** open modal to delete a service address **/
	deleteAddress(data){
		this.addressModal.deleteAddress(data);
	}

	/** open modal to add a service address **/
	addAddress(){
		this.addressModal.addAddress(this.customer);
	}
}
