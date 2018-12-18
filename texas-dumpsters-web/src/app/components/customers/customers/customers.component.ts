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
	private customer_search_info;

	private customer:Customer = null;
	private customerToEdit:Customer = null;
	private recordsList;
	private totalCount;

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
		this.getAllCustomersWithPagination(false,1,10);
		this.csv.company_key = this.authService.getCurrentSelectedCompany().id;
        Styles.fixDropDownHeigh("smallDropdown", 5);
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
		this.getAllCustomersWithPagination(true,1,10);
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
				this.getAllCustomersWithPagination(true,1,10);
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

	searchCustomerInfo(){
        console.log("customer search info changed");
        console.log(this.customer_search_info);
        if (this.customer_search_info == "" || isNullOrUndefined(this.customer_search_info)) {
            this.getAllCustomersWithPagination(false,1,10);
        }
        else
        {
            this.customerService.getCustomerByPhoneNumber(this.customer_search_info).then((response: Customer[]) => {
            if (response == null) {
                response = [];
		        this.getAllCustomersWithPagination(false,1,10);
            }else{
                console.log("Logging the customer list");
                console.log(this.customersDisplayList);
                this.customersDisplayList = response
                this.totalCustomers = response.length
            }
            })
        .catch(err => {
            console.log("error: "+ err);
        })
        }
    }


  	/*******   CSV  **********/
  	/** open modal to add a customer **/
	addCVSfile(){
		this.CSVModal.addCVSfile(this.csv);

	}

  reloadCustomerData(){
    this.getAllCustomersWithPagination(true,1,10);
  }

  getAllCustomersWithPagination(overwrite,event,page_size){
  this.pageInfo = {page:event,page_size:page_size}
        this.customerService.getAllCustomers(overwrite,this.pageInfo).then(
            response =>{
                if(response == null) {
                    console.log('Server Error');
                } else {
                    this.recordsList = JSON.parse(response);
                    console.log(this.recordsList)
                    this.customersList = this.recordsList.records;
                    this.totalCustomers=this.recordsList.total_records;
                    this.customersDisplayList=this.recordsList.records;
                    console.log("total customers: " + this.totalCustomers);
                }
            },
            error =>{
                console.log("error: "+ error);
            }
        );
        return event;
    }

}
