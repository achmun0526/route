import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Driver } from '../../model/driver';
import { SUCCESS, DRIVERS_LIST_URL, DRIVERS_URL } from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";
import {KeyValueEntity} from "../../model/key_value_entity";

@Injectable()
export class DriversService extends BaseService{

 constructor(private http: Http, private authService:AuthService) {
		super();
	}

	/**
   * This method calls the server in order to get list of drivers
   *
   *
   * */
  getDrivers(overwrite,pagingInfo):Promise<any> {
    super.showSpinner();
		var params = '?company_key=' + this.authService.getCurrentSelectedCompany().id;
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    var key=this.authService.getCurrentUser().email+'-drivers'+params;
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
      return this.http.get(DRIVERS_LIST_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res = response.json();
          console.log(res);
          var main_response= super.parsePaginationResponse(res, Driver);
          sessionStorage.setItem(key,JSON.stringify(main_response.records));
          return Promise.resolve(JSON.stringify(main_response.records));
         })
      .catch(error=>console.log("error: "+ error));
    }else{
        console.log("Sites local storage");
        super.hideSpinner();
        return Promise.resolve(sessionStorage.getItem(key));
    }
  }

  /** Get all drivers without filter by company ***/
  getAllDrivers_superAdmin(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
		var params='';
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    return this.http.get(DRIVERS_LIST_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Driver);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  /**
   * This method calls the server in order to get vehicle by Id
   *
   *
   * */
  getDriversId(driversId):Promise<Driver> {
    super.showSpinner();
    var params = driversId;
    return this.http.get(DRIVERS_LIST_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var driver:Driver=new Driver();
          driver.parseServerResponse(res.response.records[0]);
          return driver;
        }else{
          return new Driver();
        }})
      .catch(this.handleError);
  }

  /**
   * This method calls the server in order to get drivers assigned to certain driver
   *
   *
   * */
  getDriversByDriver(driverId):Promise<PaginationResponse> {
    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id+"&driver_key="+driverId;
    return this.http.get(DRIVERS_LIST_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Driver);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }


  /****  get al drivers by driver without filtering by company */
  getDriversByDriver_superAdmin(driverId):Promise<PaginationResponse> {
    super.showSpinner();
    var params="?driver_key="+driverId;
    return this.http.get(DRIVERS_LIST_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Driver);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }


  public deleteDriver(driver_key: String): Promise<PaginationResponse> {
    var urlParams = '?id=' + driver_key;
    super.showSpinner();
    return this.http.delete(DRIVERS_URL + urlParams).toPromise()
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
   * This method calls the server in order to save vehicle
   *
   *
  **/
  saveDriver(driverData):Promise<any> {
    console.log("posting the driver data to python code")
    console.log(driverData);
		super.showSpinner();
    return this.http.post(DRIVERS_URL,driverData).toPromise()
    .then(response => {
      super.hideSpinner();
      var res = response.json();
      console.log(res);
      return res;
    }).catch(err => console.log('errorrrrrr: %s', err));
  }

  /**
   * Gets a Driver instance from the current user's key
   *
   * @returns {Promise<Driver>}
   */
  getDriverByUser(): Promise<Driver> {
      super.showSpinner();
      let params = '?user_key=' + this.authService.getCurrentUser().user_key;
      return this.http.get(DRIVERS_LIST_URL + params).toPromise().then(response => {
        super.hideSpinner();
        let rec = response.json().response.records;

        if (rec == null || rec.length == 0) {
            console.log('Driver has no route for specified date!');
        } else if (rec.length == 1) {
            return rec[0];
        } else {
            console.error('Drivers should not have more than 1 route');
            return rec[0];
        }

        return new Driver();
      }).catch(err => {
        console.error('Driver Error: %s', err);
        return new Driver();
      });
  }

}
