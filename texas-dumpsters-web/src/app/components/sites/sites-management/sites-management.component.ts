import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { PAGE_SIZE} from '../../../common/app-conf';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { Router, ActivatedRoute, Params} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { isNullOrUndefined} from "util";
import { Styles } from "../../../common/styles";
import { Site} from "../../../model/site";
import { SaveSiteComponent} from "../save-site/save-site.component";
import { CsvFileComponent} from "../../common/csv-file/csv-file.component";
import { SitesService } from '../../../services/sites/sites.service';
import { CompaniesService } from '../../../services/companies/companies.service';
import { AuthService } from '../../../services/auth/auth.service';
import { CustomerService} from "../../../services/customer/customer.service";
import { Customer } from "../../../model/customer";
import { Company } from "../../../model/company";
import { Utils } from "../../../common/utils";

@Component({
  selector: 'app-sites-management',
  templateUrl: './sites-management.component.html',
  styleUrls: ['./sites-management.component.css']
})
export class SitesManagementComponent extends BaseComponent implements OnInit {

	private siteToEdit:Site = null;

	private siteList = [];
  private siteDisplayList=[];
	private customersList = [];
	private totalCustomers = 0;
	private totalSites = 0;
	private company:Company = null;
	private customerSelectedId = "";
	private csv;
	private pageInfo = {page:1,page_size:PAGE_SIZE};
	private filteredSites = []
    private currentPage = 1
    private numPerPage = 10
    private maxSize = 5;
    private customer_selected_index;
    private customer_search_info;

	// CSV modal
	@ViewChild(CsvFileComponent) CSVModal:CsvFileComponent;

	// Modals
	private addSiteModal = new EventEmitter<string|MaterializeAction>();
	private editSiteModal = new EventEmitter<string|MaterializeAction>();

	//Toasts
	private deleteSiteToast = new EventEmitter<string|MaterializeAction>();
	private deleteSiteToastError = new EventEmitter<string|MaterializeAction>();

  	constructor(private router:Router, actRoute:ActivatedRoute,private sitesService:SitesService, private customerService:CustomerService, private authService:AuthService) {
    super(actRoute);
		this.csv = {};
	}

	ngOnInit() {
		super.ngOnInit();
		this.company = this.authService.getCurrentSelectedCompany();
		this.getCustomers(true);
		this.getSitesByCustomer(false);
	}



  getSitesByCustomer(overwrite){
			console.log(overwrite);
			var custID;
    	if(this.customerSelectedId == "" || isNullOrUndefined(this.customerSelectedId)){
    		custID = null;
    	}else{
    		custID = this.customerSelectedId
			}
		console.log("component call to get sites");
		console.log(this.customerSelectedId,overwrite,custID)
    this.sitesService.getSitesByCustomer(overwrite,custID,null).then(res =>{
				 console.log(res);
				 this.siteList = JSON.parse(res);
         this.totalSites=this.siteList.length;
				 this.siteDisplayList=this.siteList.slice(0,10);
				 console.log("total sites: " + this.totalSites);
       });


  }

	changeCustomerFilter(){
		//reset pagination
		this.siteList = [];
		this.totalSites = 0;
		this.pageInfo.page = 1;
		this.getSitesByCustomer(false);
	}


  getCustomers(overwrite){
    debugger
    this.customerService.getAllCustomers(overwrite,null).then(res =>{
          this.customersList = JSON.parse(res);
          this.totalCustomers=this.customersList.length;
          Styles.fixDropDownHeigh("smallDropdown", 5);
        });
  }



	deleteSite(selectedSite){
		selectedSite.active = false;
		this.sitesService.deleteSite(selectedSite.id).then(res =>{
			if(res != null){
				this.deleteSiteToast.emit('toast');
				this.pageInfo.page = 1;
				this.getSitesByCustomer(true);
			}else{
				this.deleteSiteToastError.emit('toast');
			}
		});
	}

	redirectSiteDetails(site){
		this.router.navigate(["/management/sites_details", site.id]);
	}

	openAddSiteModal(){
		setTimeout(() => {
			this.addSiteModal.emit({action:'modal',params:['open']});
		  }, 100);
	}

	openEditSiteModal(siteToEdit){
		this.siteToEdit = siteToEdit;
		setTimeout(() => {
			this.editSiteModal.emit({action:'modal',params:['open']});
		  }, 100);
	}

	onSiteCreated(){
		//this.getAllSites();
		this.getSitesByCustomer(true);
	}

	onSiteEdited(){
		//this.getAllSites();
		this.getSitesByCustomer(true);
	}

	onAddCancelled(){
		this.addSiteModal.emit({action:'modal',params:['close']});
	}

	onEditCancelled(){
		this.siteToEdit = null;
		this.editSiteModal.emit({action:'modal',params:['close']});
	}

    searchCustomerInfo(){
        console.log("customer search info changed");
        console.log(this.customer_search_info);
        if (this.customer_search_info == "" || isNullOrUndefined(this.customer_search_info)) {
            console.log("Inside If condition")
            this.customerSelectedId = ""
            this.getSitesByCustomer(false)
        }
        else
        {
            this.customerService.getCustomerByPhoneNumber(this.customer_search_info).then((response: Customer[]) => {
            if (response == null) {
                response = [];

            }else{
                console.log("Logging the customer list");
                console.log(this.customersList);
                this.customerSelectedId = response[0].id
                this.getSitesByCustomer(false);
            }
            })
        .catch(err => {
            console.log("error: "+ err);
        })
        }
    }

	/********* Pagination ************/
	changePage(page) {
      this.pageInfo.page = page+1;
      console.log("page number:"+this.pageInfo.page);
      var start_pos = (this.pageInfo.page-1)*10;
      var end_pos = start_pos+10;
      if(end_pos>this.totalSites){
        this.siteDisplayList=this.siteList.slice(start_pos,this.totalCustomers);
      }else{
        this.siteDisplayList=this.siteList.slice(start_pos,end_pos);
      }
	  }

	/*************   CSV *************/
	addCVSfile(){
		this.CSVModal.addCVSfile(this.csv);
	}

	//*change phone numeber model update *//
    changePhone(ev){
        this.customer_search_info = ev;

    }

}
