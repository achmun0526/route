import { Injectable } from '@angular/core';
import { User } from '../../model/user';
import { Http } from '@angular/http';
import { Company } from '../../model/company';
import { PaginationResponse } from '../../model/pagination_response';
import { ADD_COMPANY_URL, GET_ALL_COMPANIES_URL, ADD_USER_TO_COMPANY_URL, DELETE_USER_TO_COMPANY_URL, GET_ALL_USER_FOR_COMPANY_URL, ADD_PRICING_URL, GET_ALL_PRICINGS_URL, SUCCESS} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";

@Injectable()
export class CompaniesService extends BaseService{

  constructor(private http: Http,private authService:AuthService) {
		super();
	}

	/**
	 * This method calls the server in order to get list of companies
	 *
	 *
	 * */
	// getCompaniesByUser(pagingInfo):Promise<any> {
	// 	super.showSpinner();
	// 	var params=super.getPagingInfoAsURLParams('',pagingInfo);
	// 	if (!isNullOrUndefined(this.authService.getCurrentUser())){
  //     params=super.getFilterAsUrlParams(params,{user:this.authService.getCurrentUser().user_key});
  //   }
  //   console.log("(CompaniesService.getCompaniesByUser) Logging the request url");
  //   console.log(GET_ALL_COMPANIES_URL + params);
  //   return this.http.get(GET_ALL_COMPANIES_URL + params).toPromise()
  //     .then(response => {
  //       console.log(response);
	// 			super.hideSpinner();
  //       var res=response.json();
  //       var main_response= super.parsePaginationResponse(res, Company);
  //       return Promise.resolve(JSON.stringify(main_response.records));
  //       })
  //     .catch(err=>console.log("getCompaniesByUser Error: %s", err));
  // }

  getCompaniesByUser(pagingInfo):Promise<any> {
		super.showSpinner();
		var params=super.getPagingInfoAsURLParams('',pagingInfo);
		if (!isNullOrUndefined(this.authService.getCurrentUser())){
      params=super.getFilterAsUrlParams(params,{user:this.authService.getCurrentUser().id});
    }
    console.log("(CompaniesService.getCompaniesByUser) Logging the request url");
    console.log(GET_ALL_COMPANIES_URL + params);
    return this.http.get(GET_ALL_COMPANIES_URL + params).toPromise()
      .then(response => {
        console.log(response);
				super.hideSpinner();
        var res=response.json();
        var main_response= super.parsePaginationResponse(res, Company);
        return Promise.resolve(JSON.stringify(main_response.records));
        })
      .catch(err=>console.log("getCompaniesByUser Error: %s", err));
  }
  /**
   * This method calls the server in order to get list of companies
   *
   *
   * */
  getAllCompanies(pagingInfo):Promise<PaginationResponse> {
    super.showSpinner();
    var params='';
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    return this.http.get(GET_ALL_COMPANIES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          return super.parsePaginationResponse(res,Company);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

  /**
   * This method calls the server in order to get list of companies
   *
   *
   * */
  getCompanyById(companyId):Promise<Company> {
    super.showSpinner();
    var params='?company='+companyId;
    return this.http.get(GET_ALL_COMPANIES_URL + params).toPromise()
      .then(response => {
        super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
          var company:Company=new Company();
          company.parseServerResponse(res.response.records[0]);
          return company;
        }else{
          return new Company();
        }})
      .catch(this.handleError);
  }

	/**
	 * This method calls the server in order to add company
	 *
	 *
	 * */
	addCompany(companyData):Promise<string> {
		super.showSpinner();
    return this.http.post(ADD_COMPANY_URL , companyData).toPromise()
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
	 * This method calls the server in order to add user to company
	 *
	 *
	 * */
	addUserCompany(userData):Promise<string> {
		super.showSpinner()
    return this.http.post(ADD_USER_TO_COMPANY_URL,userData).toPromise()
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
	 * This method calls the server in order to add user to company
	 *
	 *
	 * */
	getUsersCompany(companyId,pagingInfo):Promise<PaginationResponse> {
		super.showSpinner();
		var params=super.getPagingInfoAsURLParams('',pagingInfo);
    return this.http.get(GET_ALL_USER_FOR_COMPANY_URL+companyId+pagingInfo).toPromise()
      .then(response => {
				super.hideSpinner();
        var res=response.json();
        if (res.status===SUCCESS){
					return super.parsePaginationResponse(res,User);
        }else{
          return [];
        }})
      .catch(this.handleError);
  }

	/**
	 * This method calls the server in order to delate user for company
	 *
	 *
	 * */
	deleteUser(id):Promise<string> {
		super.showSpinner()
    return this.http.post(DELETE_USER_TO_COMPANY_URL,'id='+id).toPromise()
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
	 * This method calls the server in order to add service pricing to company
	 *
	 *
	 * */
	addPricingCompany(pricingData):Promise<string> {
		super.showSpinner()
    return this.http.post(ADD_PRICING_URL,pricingData).toPromise()
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
   * This method calls the server in order to get list of companies
   *
   *
   * */
	getAllPricing(companyId,pagingInfo):Promise<PaginationResponse> {
		super.showSpinner();
		var params = super.getPagingInfoAsURLParams(companyId,pagingInfo);
		return this.http.get(GET_ALL_PRICINGS_URL + params).toPromise()
			.then(response => {
				super.hideSpinner();
				var res=response.json();
				if (res.status===SUCCESS){
					return super.parsePaginationResponse(res,Company);
				}else{
					return [];
				}})
			.catch(this.handleError);
	}


}
