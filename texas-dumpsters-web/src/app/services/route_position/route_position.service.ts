import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { RoutePosition } from '../../model/routePosition';
import {
  SUCCESS,
  ADD_ROUTES_ITEM_URL,
  ROUTE_POSITION_HISTORY_URL,
  ARRANGE_ROUTE_ITEM_URL
} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";

@Injectable()
export class RoutePositionService extends BaseService{

	constructor(private http: Http,private authService:AuthService) {
		super();
	}

	getAllPositiionsByRoute(route_key):Promise<PaginationResponse>{
    super.showSpinner();
    var params="?route_key=" + route_key;
    return this.http.get(ROUTE_POSITION_HISTORY_URL + params).toPromise()
    .then( response => {
      super.hideSpinner();
      var res = response.json();
      if(res.status ===SUCCESS){
        return super.parsePaginationResponse(res, RoutePosition);
      }
      else{
        return [];
      }
    })
    .catch(this.handleError);
  }

  /**
  getAllRoutes(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id;
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    return this.http.get(ROUTES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,ServiceRoute);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  getRoutesByDriverOrVehicle(pagingInfo, driver_key, vehicle_key, startDate, endDate):Promise<PaginationResponse> {
    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id +
       (driver_key != null ? '&driver_key=' + driver_key:'') + 
       (vehicle_key != null ? '&vehicle_key='+ vehicle_key: '') + 
       (startDate != null && startDate != "Start Date" ? '&start_date='+ startDate: '') + 
       (endDate != null && endDate != "End Date" ? '&end_date='+ endDate: '');
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    return this.http.get(ROUTES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,ServiceRoute);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  // Get the routes fitering by one of these paremeters
  getRoutesByCompnayOrDriverOrVehicle(pagingInfo, company_key, driver_key, vehicle_key, startDate, endDate):Promise<PaginationResponse> {
    super.showSpinner();
    var params='?parameter=' +
       (company_key != null? '&company_key=' + company_key : '') +
       (driver_key != null ? '&driver_key=' + driver_key:'') + 
       (vehicle_key != null ? '&vehicle_key='+ vehicle_key: '') + 
       (startDate != null && startDate != "Start Date" ? '&start_date='+ startDate: '') + 
       (endDate != null && endDate != "End Date" ? '&end_date='+ endDate: '');
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    return this.http.get(ROUTES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,ServiceRoute);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }
  getRoutesId(routeId):Promise<ServiceRoute> {
    super.showSpinner();
    var params='?active=all&route_key='+routeId;
    return this.http.get(ROUTES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var route:ServiceRoute=new ServiceRoute();
          route.parseServerResponse(res.response.records[0]);
          return route;
        }else{
          return new ServiceRoute();
        }})
      .catch(this.handleError);
  }

	addRoutes(routeData):Promise<string> {
		super.showSpinner();
    return this.http.post(ROUTES_URL , routeData).toPromise()
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

  public deleteRoute(order_key: String): Promise<PaginationResponse> {
    var urlParams = '?id=' + order_key;
    super.showSpinner();
    return this.http.delete(ROUTES_URL + urlParams).toPromise()
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

	addRouteItem(routeData):Promise<string> {
		super.showSpinner();
    return this.http.post(ADD_ROUTES_ITEM_URL , routeData).toPromise()
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

  addRouteItemBackground(routeData):Promise<string> {
    return this.http.post(ADD_ROUTES_ITEM_URL , routeData).toPromise()
      .then(response => {
        var res=response.json();
        if (res.status===SUCCESS){
          return res;
        }else{
          return null;
        }})
      .catch(this.handleError);
  }


  arrangeRouteItem(routeItemData):Promise<string> {
    super.showSpinner();
    return this.http.post(ARRANGE_ROUTE_ITEM_URL, routeItemData).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        if(res.estatus === SUCCESS){
          return res;
        }else{
          return null;
        }
      })
      .catch(this.handleError);
  }
  */

}
