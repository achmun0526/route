import { Injectable } from '@angular/core';
import {PaginationResponse} from "../../model/pagination_response";
import {BaseService} from "../../common/base-service";
import {AuthService} from "../auth/auth.service";
import {isNullOrUndefined} from "util";
import {Http} from "@angular/http";
import {CHANGE_PROBLEM_STATUS_URL, LIST_PROBLEMS_STATUS_URL, PROBLEMS_URL, SUCCESS} from "../../common/app-conf";
import {Problem} from "../../model/problem";
import {KeyValueEntity} from "../../model/key_value_entity";

@Injectable()
export class ProblemsService extends BaseService{

  constructor(private authService:AuthService, private http:Http) {
    super()

  }

  /**
   * This method calls the server in order to get list of diposals
   *
   *
   * */
  getProblems(pagingInfo,driverKey, startDate, endDate):Promise<PaginationResponse> {
    super.showSpinner();
    var params=('?company_key='+this.authService.getCurrentSelectedCompany().id)+
      (startDate != null?'&start_date='+startDate:'')+
      (endDate != null?'&end_date='+endDate:'')+
      (driverKey != null?'&driver_key='+driverKey:'');
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }

    return this.http.get(PROBLEMS_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Problem);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  getProblemsByServiceOrder(pagingInfo, serviceOrderKey):Promise<PaginationResponse> {
    super.showSpinner();
    var params=( (serviceOrderKey != null?'?service_order_key='+serviceOrderKey : "") );

    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }

    return this.http.get(PROBLEMS_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Problem);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  /**
   * This method calls the server in order to get list of diposals
   *
   *
   * */
  public updateProblemStatusToResolved(problem_key:String):Promise<PaginationResponse> {
    return this.updateProblemStatus(problem_key,2)
  }

  /**
   * This method calls the server in order to get list of diposals
   *
   *
   * */
  public updateProblemStatusToNotResolved(problem_key:String):Promise<PaginationResponse> {
    return this.updateProblemStatus(problem_key,3)
  }



  /**
   *
   *
   * */
  private updateProblemStatus(problem_key:String,new_status:number):Promise<PaginationResponse> {
    super.showSpinner();
    var params={service_order_problem_key:problem_key,new_status:new_status};

    return this.http.post(CHANGE_PROBLEM_STATUS_URL,params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Problem);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  /**
   *
   *
   * */
  getProblemsStatusList(): Promise<KeyValueEntity[]> {
    super.showSpinner();
    return this.http.get(LIST_PROBLEMS_STATUS_URL).toPromise()
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

}
