import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { SitesService } from '../../../services/sites/sites.service';
import { SharedService } from "../../../services/shared/shared.service";
import { BaseComponent } from "../../../common/base-component";
import { Site } from "../../../model/site";
import { Company } from "../../../model/company";
import { CustomerService} from "../../../services/customer/customer.service";
import { Styles } from "../../../common/styles";
import { AuthService } from '../../../services/auth/auth.service';

@Component({
	selector: 'app-save-site',
  templateUrl: './save-site.component.html',
  styleUrls: ['./save-site.component.css']
})
export class SaveSiteComponent extends BaseComponent implements OnInit {

	@Input() siteToEdit:Site	= null;
	@Output() onSaveCompleted = new EventEmitter();
	@Output() onCancelAction 	= new EventEmitter();

	@Output() onAddCustomerSignal	= new EventEmitter<any>();

	public site;
	private title;
	private errorThrown;

	private customerList = [];
	private totalCustomers = 0;
	private selectedCompany:Company;
	//save site toasts
	private addSiteToast		 	= new EventEmitter<string|MaterializeAction>();
	private addSiteToastError 		= new EventEmitter<string|MaterializeAction>();
	private customerToastError 		= new EventEmitter<string|MaterializeAction>();
	private LatlongToastError 		= new EventEmitter<string|MaterializeAction>();

	//delete site toasts
	private deleteSiteToast 		= new EventEmitter<string|MaterializeAction>();
  	private deleteSiteToastError 	= new EventEmitter<string|MaterializeAction>();
	private addressToastError 		= new EventEmitter<string|MaterializeAction>();
	private errorModal              = new EventEmitter<string|MaterializeAction>();

	private customerListEnabled = true;

  	constructor(private authService:AuthService, private sitesService:SitesService, private sharedService:SharedService, private customerService:CustomerService) {
		super(null);
		this.site = {};
	}

  	ngOnInit() {
		this.selectedCompany = this.authService.getCurrentSelectedCompany();
		if( this.isNullOrUndefined(this.siteToEdit) ){
			this.setupNew();
		}
		else{
			this.setupEdit();
		}
		this.getCustomerList();
		this.setupCollapsibles();
	}


	/** add site **/
	setupNew(){
		this.title ="Add Site";
		this.site = {};
		this.site.active = true;
		this.site.company_key = this.selectedCompany.id;
	}

	/** edit site **/
	setupEdit(){
	  this.site={};
		this.title ="Edit " + this.siteToEdit.site_name;
		this.site.active = true;
		this.site = JSON.parse(JSON.stringify(this.siteToEdit));
	}

	/**save site**/
	saveSite(){
	    if(this.compileData(this.site)){
		    if(this.site.customer_key == null || this.site.customer_key == ""){
			    this.customerToastError.emit('toast');
		    }else{
			    console.log("in saveSite()");
                this.sitesService.saveSite(this.site).then(res =>{
			    console.log(res);
			    console.log(res.status)
            if(res.status=="SUCCESS"){
                this.site = new Site();
                this.addSiteToast.emit('toast');
                this.onSaveCompleted.emit();
            }else{
					this.site={};
                this.addSiteToastError.emit('toast');
            }
                this.onCancelAction.emit();
            });
		    }
		}
	}

	cancelAction(){
		// Needs to be cleared for new and edit other
		this.siteToEdit = null;
		this.site = new Site();
		this.onCancelAction.emit();
	}

	//*change phone numeber model update *//
	changePhone(ev){
		this.site.contact_phone = ev;
	}

	///////////////////////////
	////// customer  //////////
	///////////////////////////

	getCustomerList(){
		//for the refresh the lenth needs to be reset to zero
		this.totalCustomers = 0;
		this.customerService.getAllCustomers(false,null).then(res =>{
			this.customerList = JSON.parse(res).records;
			this.totalCustomers = JSON.parse(res).total_records;
			Styles.fixDropDownHeigh("smallDropdown", 5);
		});
	}

	customerChange(){
	}

	onCustomerCreated(){
		//clear
		this.totalCustomers = 0; 		// reset customer cuantity for refres view
		$(".customerDD").remove();	// remove dropdown, prevents duplication
		//refresh
		this.getCustomerList();
		this.closeCollapsible();
	}

	closeAddCustomer(){
		this.closeCollapsible();
	}

	////////////////////////////////////
	// events for collapsible elements
	/////////////////////////////////////

	setupCollapsibles(){
		$(document).ready(function(){
			$('.collapsibleItem').hide();
			$('.collapsibleItem').removeClass("open");
		});
	}

	toggleCollapsible(cssClass){
		if($("." + cssClass).hasClass("open")){
			$(".collapsibleItem").hide(); 				// close all
			$(".collapsibleItem").removeClass("open");	// remove class
		}else{
			$(".collapsibleItem").hide(); // close all
			$(".collapsibleItem").removeClass("open");

			$("." + cssClass).fadeIn("slow");
			$("." + cssClass).addClass("open");
		}
	}

	closeCollapsible(){
		$(".collapsibleItem").hide(); 							// close all
		$(".collapsibleItem").removeClass("open");	// remove class
	}

  compileData(data){
     try {
        if(data.longitude == null || isNaN(data.longitude) || data.longitude.indexOf('.') == -1) {
          throw new Error('Please enter a valid longitude value.');
        }
        if(data.latitude == null || isNaN(data.latitude) || data.latitude.indexOf('.') == -1) {
          throw new Error('Please enter a valid latitude value.');
        }
     }
     catch(e) {
        console.log(e);
        this.errorThrown = e;
        this.openErrorModal();
        return false;
    }
    return true;
  }

  openErrorModal(){
    setTimeout(() => {
        this.errorModal.emit({action:'modal',params:['open']})
    }, 100);
    console.log("This is open model")
  }

  onCloseClicked(){
    this.errorModal.emit({action:'modal',params:['close']});
    console.log("This is close model")
  }
}
