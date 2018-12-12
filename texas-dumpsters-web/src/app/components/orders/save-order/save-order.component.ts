import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";

import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import {FormControl} from '@angular/forms';
import { isNullOrUndefined} from "util";
import { PAGE_SIZE} from '../../../common/app-conf';
import { AuthService } from '../../../services/auth/auth.service';
import { KeyValueEntity } from "../../../model/key_value_entity";
import { BaseComponent} from "../../../common/base-component";
import { Utils } from "../../../common/utils";
import { Styles } from "../../../common/styles";
//Service
import { CustomerService} from "../../../services/customer/customer.service";
import { SitesService } from '../../../services/sites/sites.service';
import { OrdersService} from "../../../services/orders/orders.service";
// Models
import { Customer } from "../../../model/customer";
import { Site } from "../../../model/site";
import { Order } from "../../../model/order";


@Component({
  selector: 'app-save-order',
  templateUrl: './save-order.component.html',
  styleUrls: ['./save-order.component.css']
})

export class SaveOrderComponent extends BaseComponent implements OnInit {

  @Output() afterOrderSaved = new EventEmitter();
	@Output() onCancelAction = new EventEmitter();
  @Input() orderToEdit: Order;
  // @Input() OrderToEdit:Boolean;

	private displayed = true;
	private isOnEditMode=false;


	private assetsSizeList:KeyValueEntity[]=[];
  private purposeServiceList:KeyValueEntity[]=[];
	private orderStateList:KeyValueEntity[]=[];


	private customer_list = [];
  private site_list = [];

  private customer;
  private site;
  private order;


  private modal_page;
  private title;
	private date;
  private selectedCustomerId;
  private selected_company_id;
  private customer_search_criteria;
  private customer_search_info;
  private customer_selected_index;
  private site_selected_index;
  private customer_enum;

	//add Order toasts
	private addOrderToast = new EventEmitter<string|MaterializeAction>();
  private addOrderToastError = new EventEmitter<string|MaterializeAction>();
  private errorModal = new EventEmitter<string|MaterializeAction>();
  private error_message;

	private validations={customer_valid: true, site_valid: true, type_valid:true, asset_size_valid:true};


  private customer_criteria = [
  	{name:'Phone Number',val:1},
  	// {name:'Customer Name',val:2},
  	// {name:'Customer ID',val:3},
  ];


	constructor(private authService:AuthService, private ordersService:OrdersService, private customerService:CustomerService, private sitesService:SitesService) {
    super(null)
    this.date={};
	}

  ngOnInit() {
		this.setupCollapsibles();
    this.modal_page="customer";
    this.error_message = "There was an error saving the order !!!A boo ya";
    this.selected_company_id = this.authService.getCurrentSelectedCompany().id;

    this.ordersService.getOrderStateList().then(res=>{
      this.orderStateList=res;
    });

    this.ordersService.getAssetsSizeList().then(res=>{
        this.assetsSizeList=res;
    });

    this.ordersService.getPurposeOfServiceList().then(res=>{
      this.purposeServiceList=res;
    });

    if( this.isNullOrUndefined(this.orderToEdit) ){
      this.setupNew();
    }else{
      this.setupEdit();
    }
	}


  setupNew(){
    console.log("setting up new");
    this.customer= new Customer();
    this.site = new Site();
    this.order = new Order();
    this.date.date = Utils.date2FormattedString(Utils.addDays(new Date, 0), "MM/DD/YYYY");
    this.date.hour = 1;
    this.date.minutes=0;
  }

  setupEdit(){
    this.modal_page="order";
    console.log(this.orderToEdit);
    this.customer = this.orderToEdit.customer;
    this.site = this.orderToEdit.site;
    this.order = this.orderToEdit;
    this.isOnEditMode = true;
    var dateArray = this.order.service_date.split(" ");
    var date = dateArray[0];
    date = date.split("-");
    var y = date[0];
    var m = date[1];
    var d = date[2];
    this.date.date = "" + m + "/" + d + "/" + y;

    var time = dateArray[1];
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

  saveOrder(){
    if(this.customer.id==''){
      console.log("creating a customer, site, and order");
      this.customer.company_key = this.selected_company_id;
      this.customerService.addCustomer(this.customer).then(customer_response=>{
        console.log("inside the saveOrdercustomer response");
        if(customer_response['status']=="SUCCESS"){
          let customer_id = customer_response['response']['id'];
          this.site.customer_key = customer_id;
          this.site.company_key = this.selected_company_id;
          if(this.site.latitude == null || this.site.latitude == "" || this.site.latitude == 0 || this.site.longitude == "" || this.site.longitude == 0 || this.site.longitude == null)
      		{
                  this.error_message = "Site has invalid Latitude/Longitude";
                  this.openErrorModal();
          }
          this.sitesService.saveSite(this.site).then(site_response=>{
            if(site_response.status=="SUCCESS"){
              let site_id = site_response.response.id;
              this.order.company_key = this.selected_company_id;
              this.order.customer_key = customer_id;
              this.order.site_key = site_id;
              console.log("logging the order");
              this.joinDateToTime();
              this.order.service_date = this.date.fullDate;
              console.log(this.order);
              this.ordersService.saveOrder(this.order).then(order_response=>{
                if(order_response.status=="SUCCESS"){
                console.log("logging the order response");
                console.log(order_response);
                this.addOrderToast.emit('toast');
  					    this.afterOrderSaved.emit();
                this.onCancelAction.emit();
              }else{
                console.log(order_response);
                console.log("PUT ORDER ERROR MODAL HERE");
                this.error_message = "There was an error saving the Order. Make sure the size, purpose, and date is specified";
                this.openErrorModal();
              }
              });
            }else{
              console.log("PUT SITE ERROR MODAL HERE")
              this.addOrderToastError.emit('toast');
            }
          });
        }else{
          console.log("PUT Customer ERROR MODAL HERE");
          this.addOrderToastError.emit('toast');
        }

      });
    }else if(this.site.id==''){
      console.log("creating a site and order");
      this.site.customer_key = this.customer.id;
      this.site.company_key = this.selected_company_id;
      if(this.site.latitude == null || this.site.latitude == "" || this.site.latitude == 0 || this.site.longitude == "" || this.site.longitude == 0 || this.site.longitude == null)
      {
        this.error_message = "Site has invalid Latitude/Longitude";
        this.openErrorModal();
      }
      this.sitesService.saveSite(this.site).then(site_response=>{
        if(site_response.status=="SUCCESS"){
          let site_id = site_response.response.id;
          this.order.company_key = this.selected_company_id;
          this.order.customer_key = this.customer.id;
          this.order.site_key = site_id;
          console.log("logging the order");
          this.joinDateToTime();
          this.order.service_date = this.date.fullDate;
          console.log(this.order);
          this.ordersService.saveOrder(this.order).then(order_response=>{
            if(order_response.status=="SUCCESS"){
            console.log("logging the order response");
            console.log(order_response);
            this.addOrderToast.emit('toast');
            this.afterOrderSaved.emit();
            this.onCancelAction.emit();
          }else{
            console.log(order_response);
            console.log("PUT ORDER ERROR MODAL HERE");
            this.error_message = "There was an error saving the Order. Make sure the size, purpose, and date is specified";
            this.openErrorModal();
          }
          });
        }else{
          this.error_message = "There was an error saving the Site";
          this.openErrorModal();
        }
      });
    }else{
      console.log("just creating an order");
      this.order.company_key = this.selected_company_id;
      this.order.customer_key = this.customer.id;
      this.order.site_key = this.site.id;
      console.log("logging the order");
      this.joinDateToTime();
      this.order.service_date = this.date.fullDate;
      console.log(this.order);
      this.ordersService.saveOrder(this.order).then(order_response=>{
        if(order_response.status=="SUCCESS"){
          console.log("logging the order response");
          console.log(order_response);
          this.addOrderToast.emit('toast');
          this.afterOrderSaved.emit();
          this.onCancelAction.emit();
        }else{
          console.log("PUT ORDER ERROR MODAL HERE");
          this.error_message = "There was an error saving the Order. Make sure the size, purpose, and date is specified";
          this.openErrorModal();
        }
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

// Changes the Modal Page
  nextModalPage(){
    if(this.modal_page=="customer"){
      this.modal_page="site";
    }else{
      this.modal_page="order";
    }
  }

  previousModalPage(){
    if(this.modal_page=="site"){
      this.modal_page="customer";
    }else{
      this.modal_page="site";
    }
  }


  searchCustomerInfo(customer_search_info){
    console.log("customer search info changed");
    console.log(customer_search_info);
    this.customerService.getCustomerByPhoneNumber(customer_search_info).then((response: Customer[]) => {
      if (response == null) {
        response = [];
        this.customer_list=[];
      }else{
        console.log("Logging the customer list");
        this.customer_list = response;
        console.log(this.customer_list);
    }
    })
    .catch(err => {
      console.log("error: "+ err);
      this.customer_list = [];
    });
  }

  customerSelectedChange(index){
    console.log("Logging the Index");
    console.log(index);
    if(index==''){
      console.log("new customer");
      this.customer= new Customer();
    }else{
      console.log("existing customer");
      this.customer = this.customer_list[index];
      this.sitesService.getSitesByCustomer(false,this.customer.id,null).then(response=>{
        console.log(response);
        this.site_list = JSON.parse(response);
        console.log(this.site_list);
      });
    }
    console.log(this.customer);
  }

  siteSelectedChange(index){
    console.log("Logging the Index");
    console.log(index);
    if(index==''){
      console.log("new customer");
      this.site= new Site();
    }else{
      console.log("existing customer");
      this.site = this.site_list[index];
    }
    console.log(this.site);
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

  cancelAction() {
    this.orderToEdit = null;
    this.customer = new Customer();
    this.site = new Site();
    this.order = new Order();
    this.onCancelAction.emit();
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

  openErrorModal(){
    setTimeout(() => {
      this.errorModal.emit({action:'modal',params:['open']})
    }, 100);
  }

  findCustomer(){
    console.log("inside find customer");
    this.customer_selected_index=0;
    $(".smallDropdown").st="";
    console.log(this.customer_search_info);
    this.searchCustomerInfo(this.customer_search_info);
  }

  //*change phone numeber model update *//
 changePhone(ev){
   this.customer_search_info = ev;

 }


}
