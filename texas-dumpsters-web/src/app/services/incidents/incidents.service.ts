import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Incident } from '../../model/incident';
import {SUCCESS, INCIDENTS_URL, LIST_INCIDENTS_TYPE_URL, LIST_INCIDENTS_STATUS_URL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";
import {KeyValueEntity} from "../../model/key_value_entity";

@Injectable()
export class IncidentsService extends BaseService{

  constructor(private http: Http, private authService:AuthService) {
		super();
	}

    /**
   * This method calls the server in order to get list of diposals
   *
   *
   * */
  getIncidents(overwrite, pagingInfo, driverKey, startDate, endDate):Promise<string> {
    super.showSpinner();
	var params=('?company_key='+this.authService.getCurrentSelectedCompany().id)+
                (driverKey != null?'&driver_key='+driverKey:'')+
                (startDate != null?'&start_date='+startDate:'')+
                (endDate != null?'&end_date='+endDate:'');
    if (!isNullOrUndefined(pagingInfo)){
      params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
    }
    var key=this.authService.getCurrentUser().email+'-orders'+params;
    if(overwrite){
      sessionStorage.clear();
    }
    if(isNullOrUndefined(sessionStorage.getItem(key)) || overwrite){
      return this.http.get(INCIDENTS_URL + params).toPromise()
        .then(response => {
          super.hideSpinner();
          var res = response.json();
          var main_response= super.parsePaginationResponse(res, Incident);
          sessionStorage.setItem(key,JSON.stringify(main_response.records));
          return Promise.resolve(JSON.stringify(main_response.records));
         })
      .catch(this.handleError);
    }else{
      console.log("Incidents storage");
      super.hideSpinner();
      return Promise.resolve(sessionStorage.getItem(key));
  }
  }

  /**
   *
   *
   * */
  getIncidentsTypeList(): Promise<KeyValueEntity[]> {
    super.showSpinner();
    return this.http.get(LIST_INCIDENTS_TYPE_URL).toPromise()
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

  /**
   *
   *
   * */
  getIncidentsStatusList(): Promise<KeyValueEntity[]> {
    super.showSpinner();
    return this.http.get(LIST_INCIDENTS_STATUS_URL).toPromise()
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

  saveIncident(incidentData):Promise<any> {
    console.log("posting the incident data to python code")
    console.log(incidentData);
    super.showSpinner();
    return this.http.post(INCIDENTS_URL,incidentData).toPromise()
    .then(response => {
      super.hideSpinner();
      var res = response.json();
      console.log(res);
      return res;
    }).catch(err => console.log('Incident save error: %s', err));
  }


  public deleteIncident(incident_key: String): Promise<PaginationResponse> {
    var urlParams = '?id=' + incident_key;
    super.showSpinner();
    return this.http.delete(INCIDENTS_URL + urlParams).toPromise()
      .then(response => {
        super.hideSpinner();
        var res = response.json();
        console.log(res);
        if (res.status === SUCCESS) {
          return true;
        } else {
          return false;
        }
      })
      .catch(this.handleError);
  }



}
