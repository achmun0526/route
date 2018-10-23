import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Customer } from '../../model/customer';
import { ServicesAddress } from '../../model/service_address';
import { PaginationResponse } from '../../model/pagination_response';
import { SUCCESS, ADD_CUSTOMER_URL, DELETE_CUSTOMER_URL,GET_ALL_CUSTOMER_URL, ADD_ADDRESS_TO_CUSTOMER_URL, DELETE_ADDRESS_TO_CUSTOMER_URL, GET_ALL_ADDRESS_FOR_CUSTOMER_URL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import {AuthService} from "../auth/auth.service";

@Injectable()
export class CustomerService extends BaseService{

  constructor(private http: Http,private authService:AuthService) {
		super();
	}

	/**
   * This method calls the server in order to get list of customers
   *
   *
   * */


   // if (!isNullOrUndefined(this.getCurrentUser())){
   //   var key=this.getCurrentUser().email+'-company';
   //   if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
   //     sessionStorage.setItem(key,JSON.stringify(company));

// I need to update this
//


getAllCustomers(overwrite,pageInfo):Promise<string> {

    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id;
    if (!isNullOrUndefined(pageInfo)){
      params=super.getPagingInfoAsURLParams(params,pageInfo).toString();
    }
    var key=this.authService.getCurrentUser().email+'-customers'+params;
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
      console.log("pulling from server");
    return this.http.get(GET_ALL_CUSTOMER_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
            var main_response = super.parsePaginationResponse(res,Customer);
            sessionStorage.setItem(key,JSON.stringify(main_response.records));
            return JSON.stringify(main_response.records);
          }else{
              console.log("error to debug later");
          }
      })
      .catch(this.handleError);
  }else{
    console.log("pulling customers from local storage");
    super.hideSpinner();
    return Promise.resolve(sessionStorage.getItem(key));
  }
}


	getCustomerById(customerId):Promise<Customer> {
    super.showSpinner();
    var params='?customer_key='+customerId;
    return this.http.get(GET_ALL_CUSTOMER_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var customer:Customer=new Customer();
          customer.parseServerResponse(res.response.records[0]);
          return customer;
        }else{
          return new Customer();
        }})
      .catch(this.handleError);
  }

	/**
	 * This method calls the server in order to add customer
	 *
	 *
	 * */
	addCustomer(customerData):Promise<string> {
		super.showSpinner();
    return this.http.post(ADD_CUSTOMER_URL , customerData).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return res;
        }else{
          return null;
        }})
      .catch(this.handleError);
  }

  deleteCustomer(id:string):Promise<string> {
		super.showSpinner();
    var urlParams='?id='+id;
    return this.http.delete(DELETE_CUSTOMER_URL+urlParams).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return res;
        }else{
          return null;
        }})
      .catch(this.handleError);
  }

	/**
   * This method calls the server in order to get list of customers service Address
   *
   *
   * */
  getAllAddress(customerId,pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
		var params = super.getPagingInfoAsURLParams(customerId,pagingInfo);
/*    if (!isNullOrUndefined(pagingInfo)){
    	params = '';
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }*/
    return this.http.get(GET_ALL_ADDRESS_FOR_CUSTOMER_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,ServicesAddress);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

	/**
	 * This method calls the server in order to add customer
	 *
	 *
	 * */
	addAddress(addressData):Promise<string> {
		super.showSpinner();
    return this.http.post(ADD_ADDRESS_TO_CUSTOMER_URL , addressData).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return res;
        }else{
          return null;
        }})
      .catch(this.handleError);
  }

}
