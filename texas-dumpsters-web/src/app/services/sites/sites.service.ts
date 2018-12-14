// © FOREST SCHWARTZ ALL RIGHTS RESERVED

import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Site } from '../../model/site';
import { SUCCESS, ADD_SITE_URL, DELETE_SITE_URL,GET_ALL_SITE_URL, GET_SITES_BY_CUSTOMER_URL, GET_SITE_BY_ID_URL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import {AuthService} from "../auth/auth.service";

@Injectable()
export class SitesService extends BaseService{

  constructor(private http: Http, private authService:AuthService) {
		super();
	}

	/**
   * This method calls the server in order to get list of sites
   *
   *
   * */
  getAllSites(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
    var params='';
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }

    return this.http.get(GET_ALL_SITE_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Site);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }




	  /**
   * This method calls the server in order to get site by Id
   *
   *
   * */
  getSiteById(siteId):Promise<Site> {
    super.showSpinner();
    var params='site_key='+siteId;
    return this.http.get(GET_SITE_BY_ID_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var site:Site=new Site();
          site.parseServerResponse(res.response.records[0]);
          return site;
        }else{
          return new Site();
        }})
      .catch(this.handleError);
  }

	/**
   * This method calls the server in order to get list of sites
   *
   *
   * */
  getSitesByCustomer(overwrite,customerId, pagingInfo):Promise<string> {
    super.showSpinner();

    console.log("Sites DB Storage");
    var params='?company_key='+this.authService.getCurrentSelectedCompany().id;
    if(customerId != null){
      params += "&customer_key="+customerId;
    }
    var key=this.authService.getCurrentUser().email+'-sitesByCustomer'+params;
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
		params=super.getPagingInfoAsURLParams(params, pagingInfo).toString();
    return this.http.get(GET_SITES_BY_CUSTOMER_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        var main_response= super.parsePaginationResponse(res,Site);
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
	 * This method calls the server in order to save site
	 *
	 *
	 * */
	saveSite(siteData):Promise<any> {
		super.showSpinner();
    return this.http.post(ADD_SITE_URL , siteData).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        console.log(res);
        return res;
      })
      .catch(err => console.log('error: %s', err));
    }



    deleteSite(siteData):Promise<any> {
  		super.showSpinner();
      var urlParams='?id='+siteData;
      return this.http.delete(DELETE_SITE_URL+urlParams).toPromise()
        .then(response => {
  				super.hideSpinner();
          var res=response.json();
          return res;
        })
        .catch(this.handleError);
      }



  }
