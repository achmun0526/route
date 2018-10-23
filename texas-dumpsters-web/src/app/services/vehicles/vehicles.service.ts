import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Vehicle } from '../../model/vehicle';
import { SUCCESS, VEHICLES_URL, GET_VEHICLES_BY_ID_URL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";


@Injectable()
export class VehiclesService extends BaseService{

 constructor(private http: Http, private authService:AuthService) {
		super();
	}

	/**
   * This method calls the server in order to get list of vehicles
   *
   *
   * */
  getVehicles(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
		var params='?company_key='+this.authService.getCurrentSelectedCompany().id;
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    return this.http.get(VEHICLES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Vehicle);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  /** Get all vehicles without filter by company ***/
  getAllVehicles_superAdmin(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
		var params='';
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    return this.http.get(VEHICLES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Vehicle);
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
  getVehiclesId(vehiclesId):Promise<Vehicle> {
    super.showSpinner();
    var params = vehiclesId;
    return this.http.get(GET_VEHICLES_BY_ID_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var vehicle:Vehicle=new Vehicle();
          vehicle.parseServerResponse(res.response.records[0]);
          return vehicle;
        }else{
          return new Vehicle();
        }})
      .catch(this.handleError);
  }

  /**
   * This method calls the server in order to get vehicles assigned to certain driver
   *
   *
   * */
  getVehiclesByDriver(driverId):Promise<PaginationResponse> {
    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id+"&driver_key="+driverId;
    return this.http.get(VEHICLES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Vehicle);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }


  /****  get al vehicles by driver without filtering by company */
  getVehiclesByDriver_superAdmin(driverId):Promise<PaginationResponse> {
    super.showSpinner();
    var params="?driver_key="+driverId;
    return this.http.get(VEHICLES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Vehicle);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }


	/**
	 * This method calls the server in order to save vehicle
	 *
	 *
	 * */
	addVehicle(vehicleData):Promise<string> {
		super.showSpinner();
    return this.http.post(VEHICLES_URL , vehicleData).toPromise()
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
