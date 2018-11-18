import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction } from "angular2-materialize";
import { PAGE_SIZE } from '../../../common/app-conf';
import { CsvFileComponent } from "../../common/csv-file/csv-file.component";
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

import { BaseComponent } from "../../../common/base-component";



import { KeyValueEntity } from "../../../model/key_value_entity";
import { Styles }  from "../../../common/styles";
import { isNullOrUndefined } from "util";
import { Utils } from '../../../common/utils';
//models
import { Site } from "../../../model/site";
import { Customer } from "../../../model/customer";
//services
import { CustomerService } from '../../../services/customer/customer.service';
import { SitesService } from '../../../services/sites/sites.service';
import { OrdersService } from '../../../services/orders/orders.service';

import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import {map} from 'rxjs/operators/map';
import { OverlayModule } from '@angular/cdk/overlay';



export interface State {
  id: string;
  customer_name: string;
  //population: string;
}

export interface site {
  id: string;
  site_name: string;
  //population: string;
}

@Component({
  selector: 'app-orders-administrator',
  templateUrl: './orders-administrator.component.html',
  styleUrls: ['./orders-administrator.component.css']
})
export class OrdersAdministratorComponent extends BaseComponent implements OnInit {

  public customersData = [];
        public siteData = [];
        public customerId :any ='';
        public siteId:any= '';

	private ordersList = [];
  private ordersDisplayList=[]
  private siteList = [];
  private totalSites = 0;


	private customersList = [];
  private stateList=[];
  private date;
	private totalOrders;
  private date_changed_bool = false;
  private selectedCustomerId='';
	private selectedCustomer:Customer=null;
  private selectedSiteId='';
  private selectedSite:Site=null;
  private selectedDriverId='';
  // private selectedDriver:Driver=null;  //Update this one later to filter for driver as well
  private purposeServiceList:KeyValueEntity[]=[];
  private orderStateList:KeyValueEntity[]=[];
  private assetsSizeList:KeyValueEntity[]=[];

  private csv = {
		customer_key:"",
		site_key: ""
	};

  private addOrderModal = new EventEmitter<string|MaterializeAction>();
  private editOrderModal = new EventEmitter<string|MaterializeAction>();
  private incidentModal = new EventEmitter<string|MaterializeAction>();
  private selectedOrder = null;

  //add Order toasts
  private deleteOrderToast = new EventEmitter<string|MaterializeAction>();
  private deleteOrderToastError = new EventEmitter<string|MaterializeAction>();

  private pageInfo = {page:1,page_size:PAGE_SIZE};
	// CSV modal
  @ViewChild(CsvFileComponent) csvModal:CsvFileComponent;

  private siteDDenabled = false;


  stateCtrl = new FormControl();
        filteredStates: Observable < State[] > ;
         
        siteCtrl = new FormControl();
        sitefilteredStates: Observable < Site[] > ;
  constructor(private ordersService:OrdersService,private customerService:CustomerService, private router:Router, actRoute:ActivatedRoute, private sitesService:SitesService) {
		super(actRoute);
	}

  ngOnInit() {
    super.ngOnInit();

    this.date = {};
    this.date.date = Utils.date2FormattedString(Utils.addDays(new Date, 0), 'MM/DD/YYYY');

		this.ordersService.getPurposeOfServiceList().then(res=>this.purposeServiceList=res);
    this.ordersService.getOrderStateList().then(res=>this.orderStateList=res);
    this.ordersService.getAssetsSizeList().then(res=>this.assetsSizeList=res);

    // get all customers for this company
    this.getAllCustomersForCompany(false);

    //get all orders for this company, filters not set at begining
    this.loadFilteredOrders(true);
    this.filteredStatesCustomer();
    this.filteredStatesSite();

  }

   // mukesh
        filteredStatesCustomer() {
            this.filteredStates = this.stateCtrl.valueChanges
                .pipe(
                    startWith(''),
                    map(state => state ? this._filterStates(state) : this.customersData.slice())
                );
            console.log(this.filteredStates);

        }
       

        states: State[] = this.customersData;
        private _filterStates(value: string): State[] {
            const filterValue = value.toLowerCase();
            //console.log('jhjhjh');
            // console.log(this.states);
            console.log(this.customersData);
            return this.customersData.filter(state => state.customer_name.toLowerCase().indexOf(filterValue) === 0);
        }

        filteredStatesSite() {
            this.sitefilteredStates = this.siteCtrl.valueChanges
                .pipe(
                    startWith(''),
                    map(site => site ? this._filterSite(site) : this.siteData.slice())
                );
            console.log(this.sitefilteredStates);

        }

        sites: Site[] = this.siteData;
        private _filterSite(value: string): Site[] {
            const filterValue = value.toLowerCase();
            //console.log('jhjhjh');
            // console.log(this.states);
            console.log(this.siteData);
            return this.siteData.filter(site => site.site_name.toLowerCase().indexOf(filterValue) === 0);
        }


  getAllCustomersForCompany(overwrite){
    //alert(overwrite)
    overwrite = true
    this.customerService.getAllCustomers(overwrite,this.pageInfo).then(res =>{
      this.customersList = JSON.parse(res);
console.log("this.customersList");
      console.log(this.customersList);
       this.customersData = this.customersList.map((res1) => {
                    return {
                        customer_name: res1.customer_name,
                        id: res1.id
                    }
                });
                console.log(this.customersData); 

      Styles.fixDropDownHeigh("smallDropdown", 5);
    });
  }

	/**
   * Get the orders filtering by customer and site
   * */


  loadFilteredOrders(overwrite){
    var filters = {
      /*customer_id: (this.selectedCustomerId == '') ? null : this.selectedCustomerId,
                site_id: (this.selectedSiteId == '') ? null : this.selectedSiteId,
                driver_id: (this.selectedDriverId == '') ? null : this.selectedDriverId*/

                customer_id: (this.customerId == '') ? null : this.customerId,
                site_id: (this.siteId == '') ? null : this.siteId,
                driver_id: (this.selectedDriverId == '') ? null : this.selectedDriverId
    }
    console.log("updating orders inside the orders-administrator")
    this.ordersService.getOrdersByCustomersAndSitesAndDate(filters,this.date.date,this.date.date ,null,overwrite).then(res =>{
        this.ordersList = JSON.parse(res);
        this.ordersDisplayList=this.ordersList.slice(0,10);
        this.totalOrders = this.ordersList.length;
        for(let i=0;i<this.ordersDisplayList.length;i++){
          this.stateList[i]=this.ordersDisplayList[i].state;
        }
    }).catch(err => console.log('errorrrrrr: %s', err));
  }


// Changes page at bottom of the orders list
  changePage(page) {
      this.pageInfo.page = page+1;
      var start_pos = (this.pageInfo.page-1)*10;
      var end_pos = start_pos+10;
      if(end_pos>this.totalOrders){
        this.ordersDisplayList=this.ordersList.slice(start_pos,this.totalOrders);
      }else{
        this.ordersDisplayList=this.ordersList.slice(start_pos,end_pos);
      }

      for(let i=0;i<this.ordersDisplayList.length;i++){
        this.stateList[i]=this.ordersDisplayList[i].state;
      }

	  }

	/** add order by Csv**/
	addCVSFile(_callback){
		this.csvModal.addCVSfile(this.csv);
    _callback;
    console.log("after _callback in addCVSFile");
	}

  /** edit customer function **/
  deleteOrder(selectedOrder){
    this.ordersService.deleteOrder(selectedOrder.id).then(res =>{
      if(res != null){
        this.deleteOrderToast.emit('toast');
        this.pageInfo.page=1;
        this.loadFilteredOrders(true);
      }else{
        this.deleteOrderToastError.emit('toast');
      }
    });
  }

	/** change customer for reload the data **/
	/*onCustomerChanged(){
    this.pageInfo.page = 1;
    // get sites of selected customer
    if(this.selectedCustomerId == '' || isNullOrUndefined(this.selectedCustomerId)){
      this.siteList = []; // not allow sites selection
      this.totalSites = this.siteList.length;
    }else{
      this.getSites(this.selectedCustomerId);
    }
    // this.loadFilteredOrders(false);
  }*/
  
  onCustomerChanged2(id) {
           //alert('id'+id);     
            this.pageInfo.page = 1;
            this.customerId=id;
            // get sites of selected customer
            if (id == '' || isNullOrUndefined(id)) {
                this.siteList = []; // not allow sites selection
                this.totalSites = this.siteList.length;
            } else {
                this.getSites(id);
            }
            // this.loadFilteredOrders(false);
        }

  onSiteChanged(){
    this.pageInfo.page = 1;
    // this.loadFilteredOrders(false);
  }
  onSiteChanged2(id) {
            this.pageInfo.page = 1;
            this.siteId = id;
            // this.loadFilteredOrders(false);
        }


	/**
   * Takes the user to the details page of the given order
   * **/
	goToDetails(order){
		this.router.navigate(["/management/orders",order.id]);
	}

  /**
   *
   * */
  onOrderCreated(){
    this.addOrderModal.emit({action:'modal',params:['close']});
    this.loadFilteredOrders(true);
  }

  /**
   *
   *
   * */
  onOrderUpdated(){
    this.editOrderModal.emit({action:'modal',params:['close']});
    this.selectedOrder=null;
    this.loadFilteredOrders(true);
  }

  /**
   *
   * */
  onEditCancelled(){
    this.selectedOrder=null;
    this.editOrderModal.emit({action:'modal',params:['close']});
  }

  /**
   *
   * */
  openEditOrderModal(order){
    this.selectedOrder=order;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.editOrderModal.emit({action:'modal',params:['open']});
    }, 350);

  }

  /**
   * Loads the problem model to save a problem associated with an order
   * */
  openIncidentModal(order){
    this.selectedOrder=order;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.incidentModal.emit({action:'modal',params:['open']});
    }, 350);

  }

	/**
   * Loads the sites associated to the given customer
   *
   * **/
	getSites(customerId){
    this.totalSites=0;
    this.siteList=[];
	  this.siteData=[];
		this.sitesService.getSitesByCustomer(true,customerId, null).then(res =>{
      this.siteList = JSON.parse(res);
     //alert(customerId);
                  this.siteData = this.siteList.map((res1) => {
                    return {
                        site_name: res1.site_name,
                        id: res1.id
                    }
                });

      this.totalSites = this.siteList.length;
		});
  // this.loadFilteredOrders(false);
  Styles.fixDropDownHeigh("smallDropdown", 5);
  }

  openAddOrderModal(){
    setTimeout(() => {
      this.addOrderModal.emit({action:'modal',params:['open']});
    }, 350);
  }

  closeAddOrderModal(){
    this.addOrderModal.emit({action:'modal',params:['close']});
  }


  closeIncidentModal(){
    this.incidentModal.emit({action:'modal',params:['close']});
    // Update this to only update the order display if something was changed
    this.loadFilteredOrders(true);
  }

}
