import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";

import {FormControl} from '@angular/forms';

import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';

import { isNullOrUndefined } from "util";
import { PAGE_SIZE, PURPOSE_OF_SERVICE_LIST } from '../../../common/app-conf';
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { CompaniesService } from '../../../services/companies/companies.service';
import { AuthService } from '../../../services/auth/auth.service';
import { SharedService } from '../../../services/shared/shared.service';
import { OrdersService } from '../../../services/orders/orders.service';
import { Utils } from "../../../common/utils";
import { Styles } from "../../../common/styles";
import { Customer } from "../../../model/customer";
import { Site } from "../../../model/site";
import { KeyValueEntity } from "../../../model/key_value_entity";
import { CustomerService} from "../../../services/customer/customer.service";
import { SitesService } from '../../../services/sites/sites.service';
import {SaveSiteComponent} from "../../sites/save-site/save-site.component";



declare var $: any;

@Component({
  selector: 'app-save-order',
  templateUrl: './save-order.component.html',
  styleUrls: ['./save-order.component.css']
})

export class SaveOrderComponent implements OnInit, OnChanges {

  @Output() afterOrderSaved = new EventEmitter();
	@Output() onCancelAction = new EventEmitter();
  @Input() orderToEdit=null;
	@Input() customer:Customer=null;
	@Input() site:Site=null;
	@ViewChild (SaveSiteComponent) saveSite:SaveSiteComponent;

	private order;
	private title;
	private date;
	private displayed = true;
	private isOnEditMode=false;
	private assetsSizeList:KeyValueEntity[]=[];
  private purposeServiceList:KeyValueEntity[]=[];
	private orderStateList:KeyValueEntity[]=[];

	private customerList = [];
  private customerListData =  {};
  private autoCompleteInit = {};

	private totalCustomers = 0;
  private customerNames=[];
	private siteList = [];
  private siteListData;
	private totalSites = 0;
  private test_variable = "echooo";
	private selectedCustomerId = '';
	private selectedSiteId = '';
  private service_ticket_id = '';
	private siteBox = true;

  private autoCompleteParams;
  private selected_customer;

	//add Order toasts
	private addOrderToast = new EventEmitter<string|MaterializeAction>();
  private addOrderToastError = new EventEmitter<string|MaterializeAction>();

	private validations={customer_valid: true, site_valid: true, type_valid:true, asset_size_valid:true};

	constructor(private authService:AuthService, private ordersService:OrdersService, private customerService:CustomerService, private sitesService:SitesService) {
		this.order = {};
		this.date = {};
	}

  	ngOnInit() {
		this.getCustomerList();

		this.ordersService.getOrderStateList().then(res=>{
				this.orderStateList=res;
				Styles.fixDropDownHeigh("smallDropdown", 5);
		});

		this.ordersService.getAssetsSizeList().then(res=>{
				this.assetsSizeList=res;
				Styles.fixDropDownHeigh("smallDropdown", 5);
		});

    	this.ordersService.getPurposeOfServiceList().then(res=>{
			this.purposeServiceList=res;
			Styles.fixDropDownHeigh("smallDropdown", 5);
		});

	  	if (!isNullOrUndefined(this.orderToEdit)){
      	this.setupEdit();
    	}else{
			  this.setupCreate();
		}

		this.setupCollapsibles();
    // this.setupAutoComplete(this);

	}

  ngOnChanges(changes: SimpleChanges) {
    const currentOrderToEdit: SimpleChange = changes.orderToEdit;
    if(currentOrderToEdit.currentValue){
      this.order = currentOrderToEdit.currentValue;
    }
	}
	
  getAutocompleteParams(){
  return this.autoCompleteParams;
  }

	setupCreate(){
		this.order = {};
		this.order.service_time_frame = 'AM';
		//this.order.customer_key = this.customer.id;
		this.order.customer_key = null;
		//this.order.site_key = this.site.id;
		this.order.site_key = null;
		this.order.state = 1;
		this.order.company_key = this.authService.getCurrentSelectedCompany().id;
		//this.title = "Add a Service Order to " + this.customer.customer_name + " for "+ this.site.site_name;
		this.title = "Add a Service Order";

		// set default day tomorrow
		this.date.date = Utils.date2FormmatedString(Utils.addDays(new Date, 1), "MM/DD/YYYY");

		this.date.hour = 1;
		this.date.minutes = 0;
	}

  /**
	 *
	 * */
	setupEdit(){
		this.selectedCustomerId = this.order.customer_key;
		this.getSitesForCustomer();
		this.selectedSiteId = this.order.site_key;
		this.isOnEditMode=true;
		this.title = "Edit Order";

		console.log("logging the order in edit to see what is missing");
		console.log(this.order);
		var dateArray = this.order.service_date.split(" ");

		var date = dateArray[0];
		if (date) {
			date = date.split("-");
			var y = date[0];
			var m = date[1];
			var d = date[2];
			this.date.date = "" + m + "/" + d + "/" + y;
		}

		var time = dateArray[1];
		if (time) {
			time = time.split(':');
			this.date.hour = parseInt(time[0]);
			this.date.minutes = parseInt(time[1]);

			if(this.date.hour == 0){ //12 AM
				this.date.hour = 12;
				this.date.hour_type = 1;
			}else if(this.date.hour > 0 && this.date.hour < 12){
				this.date.hour_type = 1;
			}else if(this.date.hour == 12){ //12 PM
				this.date.hour_type = 2;
			}else if(this.date.hour > 12 && this.date.hour < 24){
				this.date.hour = this.date.hour - 12;
				this.date.hour_type = 2;
			}
		}
	this.displayed = true;
	}

	/**
   *
   * Saves the current order onto the database
   * */
	saveOrder(){
		this.order.customer_key = this.selectedCustomerId;
		this.order.site_key = this.selectedSiteId;
    if(this.order.customer_key == null || this.order.customer_key == ""){
      console.log("toast error");
      this.addOrderToastError.emit('toast');
    }else{
  		this.joinDateToTime();
  		this.order.service_date = this.date.fullDate;

      console.log("logging the order when saved for debugging");
      console.log(this.order);
  		this.ordersService.saveOrder(this.order).then(res =>{
  			if(res != null){
          // debugger;
  					this.addOrderToast.emit('toast');
  					this.afterOrderSaved.emit();
  			}else{
  				this.addOrderToastError.emit('toast');
  			}
        this.onCancelAction.emit();
  		});
    }
	}

	joinDateToTime(){

		var h = parseInt(this.date.hour);
		var m = parseInt(this.date.minutes);
		var s = "00";

		if(this.order.service_time_frame=='Pm' && h<12){
			h = h + 12;
		}
		if(this.order.service_time_frame=='Am' && h == 12){
			h = 0;
		}

		this.date.fullDate =
			this.date.date +
			" " +
			( (h < 10)? "0" + h : "" + h ) +
			":" +
			( (m < 10)? "0" + m : "" + m ) +
			':' +
			s;
  }

	 ////////////////
	// customer ////
	////////////////

	getCustomerList(){
		//for the refresh the lenth needs to be reset to zero
		this.customerList.length = 0;
		this.customerService.getAllCustomers(false,null).then(res =>{
			this.customerList = JSON.parse(res);
			this.totalCustomers = this.customerList.length;
			Styles.fixDropDownHeigh("smallDropdown", 5);
      for (var i = 0; i < this.totalCustomers; i++) {
        //console.log(countryArray[i].name);
        var name = this.customerList[i].customer_name;
        var name_id = this.customerList[i].id;
        this.customerNames[i]=name; //countryArray[i].flag or null
        this.customerListData[name]=name_id;
      }
		});

	}

	onCustomerChanged(){
    //Clear
    this.totalSites = 0;
    $(".siteDD").remove();

		this.getSitesForCustomer();
		// add click event for create new site element
		$(".addSiteButton").click(function(){
			$(".addSiteHandler").click();
		})
    this.saveSite.site.customer_key=this.selectedCustomerId;
	}

	onCustomerCreated(){
		//clear
		this.totalCustomers = 0; 		// reset customer cuantity for refres view
		$(".customerDD").remove();	// remove dropdown, prevents duplication
		//refresh
		this.getCustomerList();
		this.closeCollapsible();
		// refresh site Box
		this.siteBox = false;
		setTimeout(() => {
			this.siteBox = true;
		  }, 350);

	}

	closeAddCustomer(){
		this.closeCollapsible();
	}

	//////////////////////////
	//// sites ///////////////
	//////////////////////////

	getSitesForCustomer(){
		this.siteList=[];
		this.totalSites = this.siteList.length;
		this.sitesService.getSitesByCustomer(false,this.selectedCustomerId,null).then(res =>{
			this.siteList = JSON.parse(res);
			this.totalSites = this.siteList.length;
		});
   $(".siteDD").remove();
	}

	onSiteCreated(){
		//Clear
		this.totalSites = 0;
		$(".siteDD").remove();
		//refresh
		this.getSitesForCustomer();
		this.closeCollapsible();
	}

	closeAddSite(){
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
			$(".collapsibleItem").hide(); 							// close all
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




}
