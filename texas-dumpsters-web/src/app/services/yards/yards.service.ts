import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Yard } from '../../model/yard';
import { SUCCESS, ADD_YARDS_URL, GET_ALL_YARDS_URL, GET_YARDS_BY_ID_URL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";

@Injectable()
export class YardsService extends BaseService {

  constructor(private http: Http, private authService:AuthService) {
		super();
	}

	/**
   * This method calls the server in order to get list of Yards
   *
   *
   * */
  getYards(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
		var params='?company_key=' +this.authService.getCurrentSelectedCompany().id;

    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }

    return this.http.get(GET_ALL_YARDS_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Yard);
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
  getYardsById(yardId):Promise<Yard> {
    super.showSpinner();
    var params=yardId + '&active=all';
    return this.http.get(GET_YARDS_BY_ID_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var yard:Yard=new Yard();
          yard.parseServerResponse(res.response.records[0]);
          return yard;
        }else{
          return new Yard();
        }})
      .catch(this.handleError);
  }

	/**
	 * This method calls the server in order to save yard
	 *
	 *
	 * */
	saveYards(yardData):Promise<string> {
		super.showSpinner();
    return this.http.post(ADD_YARDS_URL , yardData).toPromise()
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
