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
import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Order } from '../../model/order';
import { RouteItem } from '../../model/routeItem';
import {
  SUCCESS, SERVICE_ORDER_URL, LIST_ASSETS_SIZE_URL, LIST_PURPOSE_SERVICE_URL, LIST_ORDER_STATE_URL
} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";
import {KeyValueEntity} from "../../model/key_value_entity";

@Injectable()
export class OrdersService extends BaseService {

  constructor(private http: Http, private authService: AuthService) {
    super();
  }

  /**
   * This method calls the server in order to get list of orders
   *
   *
   * */

  getOrders(overwrite,pagingInfo,filter): Promise<any> {
    super.showSpinner();
    var params = '?company_key=' + this.authService.getCurrentSelectedCompany().id;
    if (!isNullOrUndefined(pagingInfo)) {
      params = super.getPagingInfoAsURLParams(params, pagingInfo).toString();
    }
    if (!isNullOrUndefined(filter)) {
      params = super.getFilterAsUrlParams(params, filter).toString();
    }
    var key=this.authService.getCurrentUser().email+'-orders'+params;
    if(overwrite){
      sessionStorage.clear();
    }
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
      return this.http.get(SERVICE_ORDER_URL + params).toPromise()
        .then(response => {
            super.hideSpinner();
            var res = response.json();
            var main_response= super.parsePaginationResponse(res, Order);
            sessionStorage.setItem(key,JSON.stringify(main_response.records));
            return Promise.resolve(JSON.stringify(main_response.records));
           })
        .catch(err=>console.log("error: "+err));
      }else{
        console.log("Sites local storage");
        super.hideSpinner();
        return Promise.resolve(sessionStorage.getItem(key));
    }
  }

  getOrdersByDates(pagingInfo, startDate, endDate, driver,overwrite): Promise<any> {
    super.showSpinner();
    var params = '?company_key=' + this.authService.getCurrentSelectedCompany().id +
       (driver != null ? '&driver_key=' + driver:'') +
       (startDate != null ? '&start_date=' + startDate:'') +
       (endDate != null ? '&end_date='+ endDate: '') ;
    if (!isNullOrUndefined(pagingInfo)) {
      params = super.getPagingInfoAsURLParams(params, pagingInfo).toString();

    }
    var key=this.authService.getCurrentUser().email+'-orders'+params;
    console.log("logging the datastore website");
    console.log(SERVICE_ORDER_URL + params);
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
    return this.http.get(SERVICE_ORDER_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res = response.json();
          var main_response= super.parsePaginationResponse(res, Order);
          sessionStorage.setItem(key,JSON.stringify(main_response.records));
          return Promise.resolve(JSON.stringify(main_response.records));
         })
      .catch(err=>console.log("error: "+err));
    }else{
      console.log("Sites local storage");
      super.hideSpinner();
      return Promise.resolve(sessionStorage.getItem(key));
    }
  }


  //Get all orders filtering by start and end dates
  getOrders_superAdmin(pagingInfo, company_key, driver_key, startDate, endDate,overwrite): Promise<string> {
    super.showSpinner();
    var params = '?params=' +
       (company_key != null ? '&company_key='+ company_key : '') +
       (driver_key != null ? '&driver_key=' + driver_key : '') +
       (startDate != null ? '&start_date=' + startDate : '') +
       (endDate != null ? '&end_date='+ endDate : '') ;
    if (!isNullOrUndefined(pagingInfo)) {
      params = super.getPagingInfoAsURLParams(params, pagingInfo).toString();
    }
    var key=this.authService.getCurrentUser().email+'-orders'+params;
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
    return this.http.get(SERVICE_ORDER_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res = response.json();
          var main_response= super.parsePaginationResponse(res, Order);
          sessionStorage.setItem(key,JSON.stringify(main_response.records));
          return Promise.resolve(JSON.stringify(main_response.records));
         })
      .catch(this.handleError);
    }else{
      console.log("Sites local storage");
      super.hideSpinner();
      return Promise.resolve(sessionStorage.getItem(key));
    }
  }

  /**
   * This method calls the server in order to get list of orders
   *
   *
   * */
  getOrdersByCustomers(customerId, pagingInfo,overwrite): Promise<string> {
    super.showSpinner();
    var params = '?customer_key='+customerId;
    params = super.getPagingInfoAsURLParams(params, pagingInfo).toString();
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
    var key=this.authService.getCurrentUser().email+'-orders'+params;
    return this.http.get(SERVICE_ORDER_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res = response.json();
          var main_response= super.parsePaginationResponse(res, Order);
          sessionStorage.setItem(key,JSON.stringify(main_response.records));
          return Promise.resolve(JSON.stringify(main_response.records));
         })
      .catch(this.handleError);
    }else{
      console.log("Sites local storage");
      super.hideSpinner();
      return Promise.resolve(sessionStorage.getItem(key));
  }
  }

  /****
   * get orders filtering by customer and site
   */
  getOrdersByCustomersAndSites(filters, pagingInfo,overwrite): Promise<string> {
    super.showSpinner();
    //var params = '?data=D'; // test parameter to allow concat another params
    var params = '?company_key=' + this.authService.getCurrentSelectedCompany().id;
    if(filters.customer_id != null){
      params += '&customer_key=' + filters.customer_id;
    }
    if(filters.site_id != null){
      params += '&site_key=' + filters.site_id ;
    }

    params = super.getPagingInfoAsURLParams(params, pagingInfo).toString();
    var key=this.authService.getCurrentUser().email+'-orders'+params;
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
    return this.http.get(SERVICE_ORDER_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res = response.json();
          var main_response= super.parsePaginationResponse(res, Order);
          sessionStorage.setItem(key,JSON.stringify(main_response.records));
          return Promise.resolve(JSON.stringify(main_response.records));
         })
      .catch(this.handleError);
    }else{
      console.log("Sites local storage");
      super.hideSpinner();
      return Promise.resolve(sessionStorage.getItem(key));
  }
  }

  getOrdersByCustomersAndSitesAndDate(filters, startDate, endDate, pagingInfo,overwrite): Promise<any> {
    super.showSpinner();

    var params = '?company_key=' + this.authService.getCurrentSelectedCompany().id;
    params = params +
       (filters.customer_id != null ? '&customer_key=' + filters.customer_id:'')+
       (filters.site_id !=null ? '&site_key=' + filters.site_id: '')+
       (filters.driver_id != null ? '&driver_key=' + filters.driver_id:'') +
       (startDate != null ? '&start_date=' + startDate : '') +
       (endDate != null ? '&end_date='+ endDate : '');

    params = super.getPagingInfoAsURLParams(params, pagingInfo).toString();
    var key=this.authService.getCurrentUser().email+'-orders'+params;
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
      console.log("About to log the site it is pulling from");
      console.log(SERVICE_ORDER_URL+params);
    return this.http.get(SERVICE_ORDER_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res = response.json();
          var main_response= super.parsePaginationResponse(res, Order);
          sessionStorage.setItem(key,JSON.stringify(main_response.records));
          return Promise.resolve(JSON.stringify(main_response.records));
         })
      .catch(err=>console.log("error: %s",err));
    }else{
      console.log("Sites local storage");
      super.hideSpinner();
      return Promise.resolve(sessionStorage.getItem(key));
  }
  }

  /**
   * This method calls the server in order to get order by Id
   *
   *
   * */
  getOrderById(orderId): Promise<Order> {
    super.showSpinner();
    var params='?service_order_key='+orderId;
    return this.http.get(SERVICE_ORDER_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        if (res.status === SUCCESS) {
          var order: Order = new Order();
          order.parseServerResponse(res.response.records[0]);
          return order;
        } else {
          return new Order();
        }
      })
      .catch(this.handleError);
  }

  /**
   * Deletes the given order
   * */
  public deleteOrder(order_key: String): Promise<PaginationResponse> {
    var urlParams = '?id=' + order_key;
    super.showSpinner();
    return this.http.delete(SERVICE_ORDER_URL + urlParams).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        if (res.status === SUCCESS) {
          return true;
        } else {
          return false;
        }
      })
      .catch(this.handleError);
  }

  /**
   * This method calls the server in order to save order
   *
   *
   * */


  saveOrder(orderData): Promise<any> {
    // debugger
    super.showSpinner();
    return this.http.post(SERVICE_ORDER_URL, orderData).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        console.log(res);
        return res;
      })
      .catch(err => console.log('error: %s', err));
  }

  /**
   *
   *
   * */
  getOrderStateList(): Promise<KeyValueEntity[]> {
    super.showSpinner();
    return this.http.get(LIST_ORDER_STATE_URL).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        if (res.status === SUCCESS) {
          return super.parseMultipleItems(res.response, KeyValueEntity);
        } else {
          return [];
        }
      })
      .catch(this.handleError);
  }

  /**
   *
   *
   * */
  getPurposeOfServiceList(): Promise<KeyValueEntity[]> {
    // console.log("inside get orders from service list");
    super.showSpinner();
    return this.http.get(LIST_PURPOSE_SERVICE_URL).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        if (res.status === SUCCESS) {
          return super.parseMultipleItems(res.response, KeyValueEntity);
        } else {
          return [];
        }
      })
      .catch(this.handleError);
  }

  /**
   *
   *
   * */
  getAssetsSizeList(): Promise<KeyValueEntity[]> {
    super.showSpinner();
    return this.http.get(LIST_ASSETS_SIZE_URL).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        if (res.status === SUCCESS) {
          return super.parseMultipleItems(res.response, KeyValueEntity);
        } else {
          return [];
        }
      })
      .catch(this.handleError);
  }


  /**
   * This get the  purpose List
   *
   *
   * */
  stateList() {

    var list = [
      {name: 'Assigned', val: 1},
      {name: 'Problem', val: 2},
      {name: 'Failed', val: 3},
      {name: 'Completed', val: 4}
    ];
    return list;
  }

  /**
   * This get the  purpose List
   *
   *
   * */
  purposeList() {
    var list = [
      {name: 'Delivery', val: 1},
      {name: 'Removal', val: 2},
      {name: 'Swap', val: 3},
      {name: 'Relocate', val: 4}];
    return list;
  }
}
