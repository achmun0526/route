import { Injectable } from '@angular/core';
import { User } from '../../model/user';
import { Http } from '@angular/http';
import { SUCCESS, GET_ASSETS_INVENTORY} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { AuthService} from "../auth/auth.service";
import { PaginationResponse } from '../../model/pagination_response';

@Injectable()
export class AssetsService extends BaseService{

  constructor(private http: Http, private authService:AuthService) {
		super();
	}
	
	/**
	 * This method calls the server in order to add cvs file
	 *
	 *
	 * */
	requestAsstesInventory(pagingInfo):Promise<Array<any>> {
      super.showSpinner();
      var params='?company_key='+this.authService.getCurrentSelectedCompany().id;
      if (!isNullOrUndefined(pagingInfo)){
        params=super.getPagingInfoAsURLParams(params,pagingInfo).toString();
      }
      return this.http.get(GET_ASSETS_INVENTORY + params).toPromise()
        .then(response => {
          super.hideSpinner();
          var res=response.json();
          if (res.status===SUCCESS){
            return res.response.records;
          }else{
            return [];
          }})
        .catch(this.handleError);
  }

}
