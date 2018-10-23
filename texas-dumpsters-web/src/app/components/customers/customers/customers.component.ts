import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { SaveCustomerComponent} from "../save-customer/save-customer.component";
import { CsvFileComponent} from "../../common/csv-file/csv-file.component";
import { Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import { CustomerService } from '../../../services/customer/customer.service';
import { BaseComponent} from "../../../common/base-component";
import { AuthService } from '../../../services/auth/auth.service';
import { Customer } from '../../../model/customer';
import { Styles }  from "../../../common/styles";

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent extends BaseComponent implements OnInit {

	private totalCustomers;
	private customersList = [];
  private customersDisplayList=[];
	private pageInfo = {page:1,page_size:PAGE_SIZE};
	private csv;

	private customer:Customer = null;
	private customerToEdit:Customer = null;

	// Modals
	private addCustomerModal = new EventEmitter<string|MaterializeAction>();
	private editCustomerModal = new EventEmitter<string|MaterializeAction>();

	//delete Toasts
	private deleteCustomerToast = new EventEmitter<string|MaterializeAction>();
	private deleteCustomerToastError = new EventEmitter<string|MaterializeAction>();

	// CSV modal
	@ViewChild(CsvFileComponent) CSVModal:CsvFileComponent;

  	constructor(private customerService:CustomerService,private router:Router, actRoute:ActivatedRoute, private authService:AuthService) {
		super(actRoute);
		this.csv = {};
	}

	ngOnInit() {
		super.ngOnInit();
		this.getCustomers(false);
		this.csv.company_key = this.authService.getCurrentSelectedCompany().id;
Styles.fixDropDownHeigh("smallDropdown", 5);
	}

	/**get customers**/

  getCustomers(overwrite){
    console.log(overwrite);
    console.log("component call to get customers");
    this.customerService.getAllCustomers(overwrite,null).then(res =>{
      console.log(res);
      this.customersList = JSON.parse(res);
      this.totalCustomers=this.customersList.length;
      this.customersDisplayList=this.customersList.slice(0,10);
      console.log("total customer: " + this.totalCustomers);
    });

  }


	/** open modal to add a customer **/
	openAddCustomerModal(){
		this.customer = new Customer();
		setTimeout(() => {
			this.addCustomerModal.emit({action:'modal',params:['open']});
		  }, 100);
	}
	onCustomerCreated(){
		this.customer = new Customer();
		this.addCustomerModal.emit({action:'modal',params:['close']});
		this.getCustomers(true);
	}
	onAddCancelled(){
		this.customer = new Customer();
		this.addCustomerModal.emit({action:'modal',params:['close']});
	}

	/** open modal to edit a customer **/
	openEditCustomerModal(customerToEdit){
	  this.customerToEdit=null;
	  setTimeout(()=>{
      this.customerToEdit = customerToEdit;
      setTimeout(() => {
        this.editCustomerModal.emit({action:'modal',params:['open']});
      }, 100);
    },100);

	}
	onCustomerEdited(){
		this.customerToEdit = null;
		this.editCustomerModal.emit({action:'modal',params:['close']});
		this.getCustomers(true);
	}
	onEditCancelled(){
		this.customerToEdit = null;
		this.editCustomerModal.emit({action:'modal',params:['close']});
	}

	/** Go to customer details  **/
	redirectToCustomerDetails(selectedCustomer){
		this.router.navigate(["/management/customers", selectedCustomer.id]);
	}

	/** open modal to delete a customer **/
	deleteCustomer(selectedCustomer){
		selectedCustomer.active = false;
		this.customerService.deleteCustomer(selectedCustomer.id).then(res =>{
			if(res != null){
				this.deleteCustomerToast.emit('toast');
				this.pageInfo.page = 1;
				this.getCustomers(true);
			}else{
				this.deleteCustomerToastError.emit('toast');
			}
		});
	}


	/** update the page **/
	changePage(page) {
		this.pageInfo.page = page+1;
    console.log("page number:"+this.pageInfo.page);
    var start_pos = (this.pageInfo.page-1)*10;
    var end_pos = start_pos+10;
    if(end_pos>this.totalCustomers){
      this.customersDisplayList=this.customersList.slice(start_pos,this.totalCustomers);
    }else{
      this.customersDisplayList=this.customersList.slice(start_pos,end_pos);
    }

	}


  	/*******   CSV  **********/
  	/** open modal to add a customer **/
	addCVSfile(){
		this.CSVModal.addCVSfile(this.csv);

	}

  reloadCustomerData(){
    this.getCustomers(true);
  }




}
