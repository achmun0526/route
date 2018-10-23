import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {SUCCESS, GEOREVERSE_ADDRESS_URL, DIRECTIONS_API_URL, DO_GOOGLE_API_CALL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { PaginationResponse} from "../../model/pagination_response";
import { CustomLatLng } from '../../model/custom_lat_lng';
import {RouteItem} from "../../model/routeItem";
import {Utils} from "../../common/utils";

@Injectable()
export class SharedService extends BaseService{

  constructor(private http: Http) {
		super();
	}

	geoReverseAddressToLatLong(address):Promise<CustomLatLng>{
		super.showSpinner();
    return this.http.get(GEOREVERSE_ADDRESS_URL+'?address='+address+'&key='+Utils.getAPI_KEY()).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.results.length!=0){
          var lat=res.results[0].geometry.location.lat;
          var lng=res.results[0].geometry.location.lng;
          return new CustomLatLng(lat,lng);
        }else{
          return null;
        }
      })
      .catch(this.handleError);
  }


	geoReverseAddress(address):Promise<any[]>{
		super.showSpinner();
    return this.http.get(GEOREVERSE_ADDRESS_URL+'?address='+address+'&key='+Utils.getAPI_KEY()+"&components=country:US").toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.results.length!=0){
          return res.results;
        }else{
          return null;
        }
      })
      .catch(this.handleError);
  }


  /**
   *
   *
   * */
  calculateWayPointsForRouteItems(routeItems:RouteItem[]){
    if (isNullOrUndefined(routeItems) || routeItems.length<=1){
      return null;
    }
    var latLng=routeItems[0].getLatLng();
    var origin=latLng.lat+','+latLng.lng;
    latLng=routeItems[routeItems.length-1].getLatLng();
    var destination=latLng.lat+','+latLng.lng;
    var waypoints='';
    for (let item of routeItems.slice(1,routeItems.length-1)){
      latLng=item.getLatLng();
      waypoints=waypoints+latLng.lat+','+latLng.lng+'|';
    }
    //We need to remove the last pipe added
    if (waypoints.length>0){
      waypoints=waypoints.substr(0,waypoints.length-1);
    }
    super.showSpinner();
    return this.http.post(DO_GOOGLE_API_CALL,{url:DIRECTIONS_API_URL+'?key='+Utils.getAPI_KEY()+'&origin='+origin+'&destination='+destination+'&waypoints='+waypoints}).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return res.response;
        }else{
          return null;
        }
      })
      .catch(this.handleError);
  }

}
