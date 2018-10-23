import { Injectable } from '@angular/core';
import { PaginationResponse } from '../../model/pagination_response';
import { Http } from '@angular/http';
import { Message } from '../../model/message';
import { SUCCESS, MESSAGES_URL } from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";

@Injectable()
export class MessagesService extends BaseService{

	constructor(private http: Http,private authService:AuthService) {
		super();
  }
  
  /**
     * This method calls the server in order to get list of routes
     *
     *
   * */
  getMessagesByUser(pagingInfo, user_key):Promise<PaginationResponse> {
      super.showSpinner();
      var params='?sender_user_key='+this.authService.getCurrentUser().id;
      if (!isNullOrUndefined(pagingInfo)){
        params=super.getPagingInfoAsURLParams(params, pagingInfo).toString();
      }
      return this.http.get(MESSAGES_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
          return super.parsePaginationResponse(res, Message);
          }else{
          return [];
          }})
      .catch(this.handleError);
  }

  /****
   * Get message by id
   */
  getMessageById(messageId):Promise<Message> {
      super.showSpinner();
      var params='?' +
      'id=' + messageId +
      '&no-childs=true';
      return this.http.get(MESSAGES_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
            if(res.response.records.length > 0){
              return res.response.records[0];
            }            
          }else{
            return [];
          }})
      .catch(this.handleError);
  }

  /**
   * Get message by ID parent Id
   * @param messageId
   */
  getMessageChildsByParentId(pagingInfo, messageId):Promise<PaginationResponse> {
      super.showSpinner();
      var params='?' +
      'parent_message_key=' + messageId +
      '&no-childs=true';
      if (!isNullOrUndefined(pagingInfo)){
        params=super.getPagingInfoAsURLParams(params, pagingInfo).toString();
      }
      return this.http.get(MESSAGES_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
            return super.parsePaginationResponse(res, Message);                      
          }else{
            return [];
          }})
      .catch(this.handleError);
  }

  /*** Get all sent messsages by user */
  getAllSentMessagesByUser(pagingInfo, user_key):Promise<PaginationResponse> {
      super.showSpinner();
      var params='?'+
        'sender_user_key=' + user_key +
        '&no-childs=true';
      if (!isNullOrUndefined(pagingInfo)){
        params=super.getPagingInfoAsURLParams(params, pagingInfo).toString();
      }
      return this.http.get(MESSAGES_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
            return super.parsePaginationResponse(res, Message);
          }else{
            return [];
          }})
      .catch(this.handleError);
  }

  /**  Parent sent messages by user **/
  getParentSentMessagesByUser(pagingInfo, user_key):Promise<PaginationResponse> {
      super.showSpinner();
      var params='?'+
        'sender_user_key=' + user_key +
        '&parent_message_key=None' +  // null parent
        '&no-childs=true';
      if (!isNullOrUndefined(pagingInfo)){
        params=super.getPagingInfoAsURLParams(params, pagingInfo).toString();
      }
      return this.http.get(MESSAGES_URL + params).toPromise()
      .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
            return super.parsePaginationResponse(res, Message);
          }else{
            return [];
          }})
      .catch(this.handleError);
  }

  /** Get all received messages for user */
  getAllReceivedMessagesByUser(pagingInfo, user_key):Promise<PaginationResponse>{
    super.showSpinner();
    var params = '?' +
      'receiver_user_key=' + user_key +
      '&no-childs=true';
    return this.http.get(MESSAGES_URL + params).toPromise()
    .then(response => {
      super.hideSpinner();
      var res = response.json();
      if(res.status == SUCCESS){
        return super.parsePaginationResponse(res, Message);
      }else{
        return [];
      }
    })
    .catch(this.handleError);
  }

  /** Returns all received Parent messsages for user */
  getParentReceivedMessagesByUser(pagingInfo, user_key):Promise<PaginationResponse>{
    super.showSpinner();
    var params = '?' +
      'receiver_user_key=' + user_key +
      '&parent_message_key=None' + // null parent
      '&no-childs=true';
    return this.http.get(MESSAGES_URL + params).toPromise()
    .then(response => {
      super.hideSpinner();
      var res = response.json();
      if(res.status == SUCCESS){
        return super.parsePaginationResponse(res, Message);
      }else{
        return [];
      }
    })
    .catch(this.handleError);
  }

  addMessage(messageData):Promise<PaginationResponse> {
      super.showSpinner();
      return this.http.post(MESSAGES_URL , messageData).toPromise()
          .then(response => {
              super.hideSpinner();
              var res=response.json();
              if (res.status===SUCCESS){
                return res.response.id;
              }else{
                return null;
          }})
          .catch(this.handleError);
  }

  /**
   * This method calls the server in order to get list of routes
   *
   *
  
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
     * */

	/**
   * This method calls the server in order to get route by Id
   *
   *

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
       * */



    /**
      * Deletes the given message
    **/
    public deleteMessage(message_key: String): Promise<PaginationResponse> {
        var urlParams = '?id=' + message_key;
        super.showSpinner();
        return this.http.delete(MESSAGES_URL + urlParams).toPromise()
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
 * */
  /**
   * Arrange routeItem
   * @param routeItemData contains id and direccion
   
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
