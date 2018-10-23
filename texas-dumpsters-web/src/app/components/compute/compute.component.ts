/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 *
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/*
 * File:   main.cpp
 * Author: forest schwartz
 *
 * Created on December 12, 2017, 7:09 PM
 */

import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import{PURPOSE_OF_SERVICE_LIST, ASSET_SIZE_LIST} from "../../common/app-conf";

import { Http } from '@angular/http';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/toPromise';
import { PaginationResponse } from '../../model/pagination_response';
import {SitesService} from '../../services/sites/sites.service'
import {FacilitiesService} from '../../services/facilities/facilities.service'
import {YardsService} from '../../services/yards/yards.service'
import {ComputeService} from '../../services/compute/compute.service';
import { Company} from '../../model/company';
import { ServerEntity} from "../../common/server_entity";

import {Facility} from "../../model/facility";
import {Yard} from "../../model/yard";
import {Order} from "../../model/order";


import { ServiceDetailComponent} from "./service-detail/service-detail.component";
import {Site} from '../../model/site';
import {OrdersService} from '../../services/orders/orders.service';
import { BaseComponent } from '../../common/base-component';
import {MapHandlerComponent} from '../common/map-handler/map-handler.component';
import {AppComponent} from '../../app.component'
import { KeyValueEntity } from '../../model/key_value_entity';
import {FormControl} from '@angular/forms';
import { Utils } from '../../common/utils';
import { Styles }  from '../../common/styles';
import { MaterializeDirective, MaterializeAction} from 'angular2-materialize';
import {ServiceRoute} from '../../model/route'
import {CustomLatLng} from '../../model/custom_lat_lng'
import {RouteItem} from '../../model/routeItem';
// Services
import { Router, ActivatedRoute, Route } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import {RoutesService} from '../../services/routes/routes.service'
import {CompaniesService} from '../../services/companies/companies.service';

@Component({
  selector: 'app-compute',
  templateUrl: './compute.component.html',
  styleUrls: ['./compute.component.css']
})
export class ComputeComponent extends BaseComponent implements OnInit {
  private serviceDetailModal = new EventEmitter<string|MaterializeAction>();

  private routeList: ServiceRoute[] = [];
  private ordersList = [];
  private facilityList = [];
  private yardsList = [];
  private orders = [];
  private landfills = [];
  private depots = [];
  private trucks = [];
  private iterations=[];
  private data = {};

  private assetsSizeList: KeyValueEntity[] = [];
  // private service_routes:ServiceRoute[]=[];   // The service_routes array is here
  private route_items_holder=[];
  private service_routes=[];   // The service_routes array is here


  private checked;
  private data_loaded = 0;
  private current_site:Site;
  private sorted_routes = [];
  private truck_route_data = [];
  private truck_route;
  private num_of_displayed_routes=0;
  private route_object_list = [];
  private routes_object=[]
  private route_object_list_arr = [];
  private num_of_routes;
  private numbers = [];
  private total_route_duration = [];
  private total_route_distance = [];
  private compiled_route_duration;
  private compiled_route_distance;
  private date;
  private num_of_services;
  private date_changed_bool = false;
  private num_of_trucks;
  private num_of_iterations;
  private yard_time;
  private service_time;
  private current_entity:ServerEntity;
  private markers_initialized = false;
  private current_route_list_display_number;
  service_detail_number:number;
  service_detail_info:any;

  @ViewChild(MapHandlerComponent) mapHandler: MapHandlerComponent;

  private selectedCompany: string[];
  private selectedCompany_before: string[];
  private enableCompanyDD: boolean;
  private companyList: any;
  private errorModal = new EventEmitter<string|MaterializeAction>();
  private errorThrown;

  private isAdmin = false;

  constructor(private authService: AuthService,private route: ActivatedRoute, private http: Http, private computeService: ComputeService,
    private siteService: SitesService, private ordersService: OrdersService, private facilityService: FacilitiesService,
    private yardsService: YardsService, private companiesService: CompaniesService, private routesService: RoutesService) {
    super(route);
  }


  ngOnInit() {
      super.ngOnInit();

      this.facilityService.getFacilities(null).then(res => {
        this.facilityList = res.records;
      });

      this.yardsService.getYards(null).then(res => {
        this.yardsList = res.records;
      });

      this.date = {};
      // set default day tomorrow
      this.date.date = Utils.date2FormmatedString(Utils.addDays(new Date, 0), 'MM/DD/YYYY');
      this.ordersService.getAssetsSizeList().then(res => this.assetsSizeList = res);

      // this.ordersService.getOrders(false,null,null).then(res => {
      //   this.ordersList = JSON.parse(res);
      //   this.num_of_services = this.ordersList.length;
      // });

      this.ordersService.getOrdersByDates(null, this.date.date, this.date.date, null,false).then(res => {
        console.log(res);
        this.ordersList = JSON.parse(res);
        this.num_of_services = this.ordersList.length;
      });


      this.companiesService.getCompaniesByUser(null).then(res => {
          this.companyList = JSON.parse(res);
          // this.selectedCompany = this.authService.getCurrentSelectedCompany();
          Styles.fixDropDownHeigh('smallDropdown', 5);
      });
  }

compile_data(){

  this.data = {};
  this.orders = [];
  this.trucks = [];
  try {
    if(this.ordersList.length == 0)
      throw new Error('There are no orders.');
    if(this.facilityList.length == 0)
      throw new Error('Facilities cannot be 0.');
    if(this.yardsList.length == 0)
      throw new Error('There cannot be 0 yards!');
  }
  catch(e) {
    console.log(e);
    this.errorThrown = e;
    this.openErrorModal();
  }

  for (let i = 0; i < this.ordersList.length; i++) {
    let Order = {};

    Order['order_id'] = this.ordersList[i].id;
    Order['customer_key'] = this.ordersList[i].customer_key;
    Order['quantity'] = parseInt(this.ordersList[i].quantity);
    let order_site = this.ordersList[i].site;
    Order['site_id'] = order_site.id;
    Order['latitude'] = parseFloat(order_site.latitude);
    Order['longitude'] = parseFloat(order_site.longitude);

    let size_string = parseInt(this.assetsSizeList[this.ordersList[i].asset_size - 1].name);
    Order['size'] = size_string;
    Order['type'] = this.ordersList[i].purpose_of_service;
    this.orders.push(Order);
  }

  // Forming an array of depots
  for (let i = 0; i < this.facilityList.length; i++) {
    let Facility = {};
    Facility['latitude'] = parseFloat(this.facilityList[i].latitude);
    Facility['longitude'] = parseFloat(this.facilityList[i].longitude);
    this.depots.push(Facility);
  }

  // Forming an array of landfills
  for (let i = 0; i < this.yardsList.length; i++) {
    let Yard = {};
    Yard['latitude'] = parseFloat(this.yardsList[i].latitude);
    Yard['longitude'] = parseFloat(this.yardsList[i].longitude);
    this.landfills.push(Yard);
  }

  let Truck_Value = {};
  Truck_Value['truck_num'] = parseInt(this.num_of_trucks);
  this.trucks.push(Truck_Value);

  let Iteration_Value = {};
  Iteration_Value['iteration_num'] = parseInt(this.num_of_iterations);
  this.iterations.push(Iteration_Value);

  this.data['orders'] = this.orders;
  this.data['depots'] = this.depots;
  this.data['landfills'] = this.landfills;
  this.data['num_of_trucks'] = this.trucks;
  this.data['num_of_iterations']=this.iterations;

}

compute() {
  this.numbers=[];
  this.num_of_routes=0;

  if(isNaN(this.num_of_trucks)==true){
    console.log("you need to input the number of trucks");
  }

  if(isNaN(this.num_of_iterations)==true){
    console.log("default number of iterations set to 10,000");
    this.num_of_iterations=10000;
  }

    // Forming an array of orders
  if (this.data_loaded === 0 || this.date_changed_bool) {
      this.date_changed_bool = false;
      this.compile_data();  // creating json of data to send to compute server
      this.data_loaded = 1;

      console.log(JSON.stringify(this.data));
      this.http.post('http://35.237.114.111:80', this.data)
      .toPromise()
        .then(val => {
            this.update_page(val['_body']);
          })
        .catch(err => console.log('error: %s', err));
    } else {
      let Truck_Value = {};
      Truck_Value['truck_num'] = parseInt(this.num_of_trucks);
      this.trucks[0] = Truck_Value;
      this.data['num_of_trucks'] = this.trucks;

      let Iteration_Value = {};
      Iteration_Value['iteration_num'] = parseInt(this.num_of_iterations);
      this.iterations[0]=Iteration_Value;
      this.data['num_of_iterations']=this.iterations;

      console.log(this.data);
      this.http.post('http://35.237.114.111:80', this.data).toPromise()
        .then(val => {
            this.update_page(val['_body']);
          })
        .catch(err => console.log('error: %s', err));

    }
}


on_company_changed() {
    this.computeService.set_selected_company(this.selectedCompany);
}


update_page(body_of_data) {
  this.compiled_route_duration = 0;
  this.compiled_route_distance=0;
  console.log("logging the returned data");
  console.log(body_of_data);
  this.numbers=[];
  this.route_object_list_arr=[];
  let json_data = JSON.parse(body_of_data);
  this.sorted_routes = json_data.routes;
  this.num_of_routes = this.sorted_routes.length;
  for (let j = 0; j < this.num_of_routes; j++){
    let number={};
    number['display']=false;
    this.numbers[j] = number;

    this.truck_route = this.sorted_routes[j];
    let symbols = this.truck_route.symbols;
    let route_object_list = [];
    this.total_route_duration[j] = 0;
    this.total_route_distance[j] = 0;

////////////////////////////Testing out the new route class////////////////////////////////////////
    var service_route= new ServiceRoute();
/////////////////////////////////////////////////////////////////////////////////////////////////
      for (let i = 0; i < symbols.length-1; i++) {

          let route_object = {};
          let symbol = symbols[i];
          let type = symbol.substring(0,1);
          let duration = this.truck_route.btw_durations[i];
          if(type=="L"){
            if(isNaN(this.yard_time)==false){
            duration = duration + parseFloat(this.yard_time)/60;
            }
          }else{
            if(isNaN(this.service_time)==false){
            duration=duration+parseFloat(this.service_time)/60;
            }
          }

          this.total_route_duration[j] = this.total_route_duration[j] + duration;
          let distance = this.truck_route.btw_distances[i];
          this.total_route_distance[j] = this.total_route_distance[j] + distance;



          /////// Testing out new route class...Creating the routeItem/////////
          var route_item= new RouteItem();
          let _entity = this.get_entity_from_symbol(symbol);
          let _entity_key=this.get_entity_key_from_symbol(symbol);
          let _entity_type = this.get_entity_type_from_symbol(symbol);
          let _dist_2_next = distance;
          let _time_2_next = duration;
          let _route_number = j;
          route_item.populate(_entity_type,_entity_key,i,_entity,_dist_2_next,_time_2_next,_route_number);
          service_route.populate_route_items(route_item);
          service_route.company_key= this.authService.getCurrentSelectedCompany().id;
          //// GET RID OF THE IF STATEMENT LATER AND KEEP THE ELSE ///////////////////////////////
              this.date.date = Utils.date2FormmatedString(Utils.addDays(new Date, 0), 'MM/DD/YYYY');   //GET RID OF THIS DURING PRODUCTION
              console.log(this.date.date);
              service_route.date = this.date.date;
          //////////////////////////////////////////////

          route_object['display'] = false;
          route_object['type']=_entity_type;
          if(_entity_type=='serviceorder'){
            route_object['size']=Utils.getNameFromVal(ASSET_SIZE_LIST, _entity.asset_size);
            route_object['order_type']=Utils.getNameFromVal(PURPOSE_OF_SERVICE_LIST,_entity.purpose_of_service);
          }
          route_object_list[i] = route_object;
      }

/////////// Storing the ServiceRoute into the serviceRoutes[] /////////////////
      this.compiled_route_distance = this.compiled_route_distance+this.total_route_distance[j];
      this.compiled_route_duration = this.compiled_route_duration+this.total_route_duration[j];
      service_route.time = this.total_route_duration[j].toFixed(2);
      service_route.distance = this.total_route_distance[j].toFixed(2);
      this.route_items_holder[j]=service_route.route_items;
      this.service_routes[j]=service_route;
      this.total_route_duration[j] = this.total_route_duration[j].toFixed(2);
      this.total_route_distance[j] = this.total_route_distance[j].toFixed(2);
      this.route_object_list_arr[j] = route_object_list;
    }
    console.log('LOGGING ROUTE OBJECT LIST ARR');
    console.log(this.route_object_list_arr);
    this.compiled_route_distance = this.compiled_route_distance.toFixed(2);
}

get_entity_from_symbol(symbol){
  let type = symbol.substring(0, 1);

  if (type == 'L') {
    let location_string = symbol.substring(1);
    let location_int = parseInt(location_string);
    let entity = this.yardsList[location_int];
    return entity;
  } else if(type == 'H') {
    let location_string = symbol.substring(1);
    let location_int = parseInt(location_string);
    let entity = this.facilityList[location_int];
    return entity;
  } else {
    let location_int = parseInt(symbol);
    var current_order= this.ordersList[location_int];
    let entity = current_order;
    return entity;
  }
}

get_entity_type_from_symbol(symbol){
  let  entity= '';
  let type = symbol.substring(0, 1);
  if (type == 'L') {
    entity='yard';
  } else if(type == 'H') {
    entity='facility';
  } else {
    entity='serviceorder';
  }
  return entity;
}

// This pulls out the key of the entity so we can reference that object later
get_entity_key_from_symbol(symbol){
  let type = symbol.substring(0, 1);
  let entity_key = '';
  if (type == 'L') {
    let location_string = symbol.substring(1);
    let location_int = parseInt(location_string);
    entity_key = this.yardsList[location_int].id;
  } else if(type == 'H') {
    let location_string = symbol.substring(1);
    let location_int = parseInt(location_string);
    entity_key = this.facilityList[location_int].id;
  } else {
    let location_int = parseInt(symbol);
    var current_site= this.ordersList[location_int];
    entity_key = current_site.id;
  }
  return entity_key;
}

get_latlng_from_symbol(symbol) {
    let address = '';
    let type = symbol.substring(0, 1);
    if (type == 'L') {
      let location_string = symbol.substring(1);
      let location_int = parseInt(location_string);
      let lat = this.yardsList[location_int].latitude;
      let lng = this.yardsList[location_int].longitude;
      // var latlng= new google.maps.LatLng(lat, lng);
      var latlng = new CustomLatLng(lat,lng);
    } else if(type == 'H') {
      let location_string = symbol.substring(1);
      let location_int = parseInt(location_string);
      let lat = this.facilityList[location_int].latitude;
      let lng = this.facilityList[location_int].longitude;
      // var latlng= new google.maps.LatLng(lat, lng);
      var latlng = new CustomLatLng(lat,lng);
    } else {
      let location_int = parseInt(symbol);
      var current_site= this.ordersList[location_int].site;
      let lat = current_site.latitude;
      let lng = current_site.longitude;
      // var latlng= new google.maps.LatLng(lat, lng);
      var latlng = new CustomLatLng(lat,lng);
    }
    return latlng;
  }

get_address_from_symbol(symbol) {
    let address = '';
    let type = symbol.substring(0, 1);
    if (type == 'L') {
      let location_string = symbol.substring(1);
      let location_int = parseInt(location_string);
      address = this.yardsList[location_int].getFormattedAddress();
    } else if(type == 'H') {
      let location_string = symbol.substring(1);
      let location_int = parseInt(location_string);
      address = this.facilityList[location_int].getFormattedAddress();
    } else {
      let location_int = parseInt(symbol);
      var current_site= this.ordersList[location_int].site;
      address = current_site.site_address+', '+current_site.site_city+', '+current_site.site_state+', '+current_site.site_zipcode;
    }
    return address;
  }


  filter() {
    if (this.date != null){
      this.date_changed_bool = true;
      // this.ordersService.getAssetsSizeList().then(res => this.assetsSizeList = res);
      this.ordersService.getOrdersByDates(null, this.date.date, this.date.date, null,true).then(res => {
      console.log(res);
        this.ordersList = JSON.parse(res);
        this.num_of_services = this.ordersList.length;
      });
    }
  }

  view_route(number,route_list_number) {
    number.display = true;
    this.num_of_displayed_routes=this.num_of_displayed_routes+1;
    this.current_route_list_display_number=route_list_number;
  }

  close_view_route(number) {
    number.display = false;
    this.num_of_displayed_routes=this.num_of_displayed_routes-1;
  }

  server_entity_view(item,route_number,server_route_number){
    item.display=true;
    this.mapHandler.add_waypt(route_number,this.service_routes[server_route_number]);
  }
  close_server_entity_view(item,route_number,server_route_number){
    item.display=false;
    this.mapHandler.remove_waypt(route_number,this.service_routes[server_route_number]);
  }

  show_event_data(event_data){
    this.service_detail_number = event_data;
    this.service_detail_info = this.route_items_holder[this.current_route_list_display_number][this.service_detail_number];
    this.markers_initialized = true;
    setTimeout(() => {
      this.serviceDetailModal.emit({action:'modal',params:['open']});
      }, 100);
  }

  saveRoutes(){
    console.log("compute.component.saveRoutes()");
    let route = { "RouteItems":[
        {"entity_type": 'serviceorder',"entity_key":'4656169750626304',"latitude":'32.5',"longitude":'-96.79',"dist_2_next":25.6,"time_2_next":23.6,"sort_index":20},
        {"entity_type": 'serviceorder',"entity_key":'4804966745112576',"latitude":'666',"longitude":'-777',"dist_2_next":97,"time_2_next":89,"sort_index":15},
        {"entity_type": 'facility',"entity_key":'5150623297175552',"latitude":'32.5',"longitude":'-96.79',"dist_2_next":25.6,"time_2_next":23.6,"sort_index":11},
      ],"total_distance":25.6,"total_time":30.5
    };
    route["date"]=this.date.date;
    console.log(route);

    this.routesService.saveRoutes(route);
  }

  openErrorModal(){
    setTimeout(() => {
      this.errorModal.emit({action:'modal',params:['open']})
    }, 100);
  }

  update_orders_shown(){
    console.log("updating orders shown");

  }

  onCloseClicked(){
    this.errorModal.emit({action:'modal',params:['close']});
  }

}
