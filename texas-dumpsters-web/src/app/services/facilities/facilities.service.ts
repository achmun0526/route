import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Facility } from '../../model/facility';
import { SUCCESS, ADD_FACILITY_URL, GET_ALL_FACILITY_URL, GET_FACILITY_BY_ID_URL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";

@Injectable()
export class FacilitiesService extends BaseService{

  constructor(private http: Http, private authService:AuthService) {
		super();
	}

	/**
   * This method calls the server in order to get list of diposals
   *
   *
   * */
  getFacilities(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
		var params='?company_key='+this.authService.getCurrentSelectedCompany().id;
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }

    return this.http.get(GET_ALL_FACILITY_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Facility);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

	/**
   * This method calls the server in order to get yard by Id
   *
   *
   * */
  getDisposalId(disposalId):Promise<Facility> {
    super.showSpinner();
    var params = disposalId;
    return this.http.get(GET_FACILITY_BY_ID_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var disposal:Facility=new Facility();
          disposal.parseServerResponse(res.response.records[0]);
          return disposal;
        }else{
          return new Facility();
        }})
      .catch(this.handleError);
  }

	/**
	 * This method calls the server in order to save diposals
	 *
	 *
	 * */
	saveDisposal(disposalData):Promise<string> {
		super.showSpinner();
    return this.http.post(ADD_FACILITY_URL , disposalData).toPromise()
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
