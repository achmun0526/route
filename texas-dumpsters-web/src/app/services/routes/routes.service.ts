import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { ServiceRoute } from '../../model/route';
import { RouteItem } from '../../model/routeItem';
import {
  SUCCESS,
  ADD_ROUTES_ITEM_URL,
  ROUTES_URL,
  FLUSH_ROUTES_URL,
  ARRANGE_ROUTE_ITEM_URL,
} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";
import {LZStringService} from 'ng-lz-string';
import {Utils} from "../../common/utils";
import {DriversService} from "../drivers/drivers.service";
import {Driver} from "../../model/driver";

@Injectable()
export class RoutesService extends BaseService{

	constructor(private http: Http,private authService:AuthService, private driverService: DriversService,
              private lz: LZStringService) {
		super();
	}

	/**
   * This method calls the server in order to get list of routes
   *
   *
   * */
  getAllRoutes(pagingInfo, optimized):Promise<PaginationResponse> {
    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id +
    ( (optimized != null)? "&optimized="+optimized : "");
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

  /**
   * This method calls the server in order to get list of routes
   *
   *
   * */
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
  getRoutesByCompanyOrDriverOrVehicle(pagingInfo, company_key, driver_key, vehicle_key, startDate, endDate):Promise<any> {
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
        console.log("in getRoutesByCompanyOrDriverOrVehicle");
        console.log(res);
        console.log("res.response.records");
        console.log(res.response.records);
        if (res.status===SUCCESS){
          return res.response.records;
        }})
      .catch(err=> console.log("error in routes.services.getRoutesByCompanyOrDriver %s",err));
  }

	/**
   * This method calls the server in order to get route by Id
   *
   *
   * */
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



addRouteItems(route_items):Promise<any>{

  console.log(route_items.length);
  console.log(route_items);
          return this.http.post(ADD_ROUTES_ITEM_URL, route_items).toPromise()
            .then(response => {
              super.hideSpinner();
              console.log(response);
            })
            .catch(err=>(console.log("error: "+err)));
}



  /**
   * Deletes the given order
   * */
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



	/**
	 * This method calls the server in order to save item in route
	 *
	 *
	 * */
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
  //
  addRouteItemRecursive(routeData):Promise<string> {
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

  /**
   * Arrange routeItem
   * @param routeItemData contains id and direccion
   */
  arrangeRouteItem(routeItemData):Promise<string> {
    super.showSpinner();
    console.log("rearrange", routeItemData);
    return this.http.post(ARRANGE_ROUTE_ITEM_URL, routeItemData).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        if(res.status === SUCCESS){
          return res;
        }else{
          return null;
        }
      })
      .catch(this.handleError);
  }


// This saves the ServiceRoute model to the session storage so we can look at it inside the Route segment in the Dashboard
  saveRoutes(route){
    debugger
    console.log("routes.service.saveRoutes()");

    let route_portion={};
    let route_items = route.route_items;
    route_portion["total_time"]=parseFloat(route.time);
    route_portion["total_distance"]=parseFloat(route.distance);
    route_portion["driver"]=null;
    route_portion["num_of_stops"]=route_items.length;
    route_portion["company_key"]=route.company_key;
    route_portion["date"]=route.date;
    route_portion["status"]=1;

    console.log(route_portion);

    return this.http.post(ROUTES_URL, route_portion).toPromise()
      .then(response => {
        let res = response.json();
        console.log(res);
        for(let i=0;i<route_items.length;i++){
          route_items[i]["route_key"]=res.response.id;
        }

        console.log(route_items);
        debugger
        this.http.post(ADD_ROUTES_ITEM_URL, route_items).toPromise()
          .then(response => {
            super.hideSpinner();
            console.log(response);
          })
          .catch(err=>(console.log("error: "+err)));

      })
      .catch(err=>(console.log("error: "+err)));
  }

  /**
   * Deletes all the routes and route items for a given day
   * */
  deleteRoutesByDate(date){
    debugger
    var params = '?company_key=' + this.authService.getCurrentSelectedCompany().id +
       (date != null ? '&start_date=' + date:'') +
       (date != null ? '&end_date='+ date: '') ;
    super.showSpinner();
    return this.http.delete(FLUSH_ROUTES_URL + params).toPromise()
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


  getRouteItems(){
    console.log("inside routes.service.getRoute")
    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id;

    return this.http.get(ADD_ROUTES_ITEM_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        console.log(res);
        console.log(res.response.records);
        if (res.status===SUCCESS){
          return res.response.records;
        }})
      .catch(err=> console.log("error in routes.services.getRouteItems %s",err));
  }

  getRouteItemsByRouteAndCompany(route_key){
    console.log("inside routes.service.getRouteItemsByRouteAndCompany");
    super.showSpinner();
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id +
    (route_key != null ? '&route_key=' + route_key:'');
    return this.http.get(ADD_ROUTES_ITEM_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        console.log("before res");
        console.log(res);
        console.log("before records");
        console.log(res.response.records);
        if (res.status===SUCCESS){
          return res.response.records;
        } else {
          return [];
        }})
      .catch(err=> console.log("error in routes.services.getRouteItemsByRouteAndCompany %s",err));
  }

  getRouteItemsByRoute(route_key){
    super.showSpinner();
    return this.http.get(ADD_ROUTES_ITEM_URL + '?route_key=' + route_key).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        console.log("before res");
        console.log(res);
        console.log("before records");
        console.log(res.response.records);
        if (res.status===SUCCESS){
          return res.response.records;
        } else {
          return [];
        }
      }).catch(err=> console.log("error in routes.services.getRouteItemsByRoute %s",err));
  }

  getRouteByDriver(driverKey, date = ''): Promise<ServiceRoute> {
      let params = '?driver_key=' + driverKey;

      if (date == '') {
          date = Utils.date2FormattedString(new Date(), 'MM/DD/YYYY');
      }

      params += '&start_date=' + date;
      params += '&end_date=' + date;

      return this.http.get(ROUTES_URL + params).toPromise().then(response => {
        let rec = response.json().response.records;
        if (rec != null && rec.length > 0) {
          return rec[0] as ServiceRoute;
        } else {
          return new ServiceRoute();
        }
      }).catch(err => {
        console.error('Error in getting route by Driver... %s', err);
        return new ServiceRoute();
      });
  }

  getRouteByUser(date = ''): Promise<ServiceRoute> {
    return this.driverService.getDriverByUser().then(driver => {
      return this.getRouteByDriver(driver.id, date);
    });
  }

  getRouteItemsByDriver(driverKey, date = '') {
    return this.getRouteByDriver(driverKey, date).then(route => {
      return this.getRouteItemsByRoute(route.id);
    })
  }

  getRouteItemsByUser(date = '') {
    return this.getRouteByUser(date).then(route => {
      return this.getRouteItemsByRoute(route.id);
    })
  }

  get_routes_from_cache(){
    super.showSpinner();
    var params = '?company_key=' + this.authService.getCurrentSelectedCompany().id;
    var key=this.authService.getCurrentUser().email+'-ServiceRoutes'+params;
    sessionStorage.getItem(key);

  }
}
