import { Injectable } from '@angular/core';
import { User } from '../../model/user';
import { Http } from '@angular/http';
import { Csv } from '../../model/csv';
import { SUCCESS, ADD_CSV_FILE_URL} from '../../common/app-conf';
import { BaseService} from '../../common/base-service';
import { isNullOrUndefined} from "util";
import { ServerEntity } from '../../common/server_entity';

@Injectable()
export class CsvService extends BaseService{

  constructor(private http: Http) {
		super();
	}

	/**
	 * This method calls the server in order to add cvs file
	 *
	 *
	 * */
	addCSVfile(data):Promise<CSV_response> {
    console.log("inside addCSVfile inside the csv.service");
    console.log("logging data");
    console.log(data);
		super.showSpinner();
    return this.http.post(ADD_CSV_FILE_URL , data).toPromise()
      .then(response => {
        console.log("csv.service.http.response0");
				super.hideSpinner();
        console.log("csv.service.http.response1");
        var res=response.json();
        console.log("csv.service.http.response2");
        if (res.status===SUCCESS){
          var temp = new CSV_response();
          temp.parseServerResponse(res.response);
          return temp;
        }else{
          return null;
        }})
        .catch(this.handleError);
  }

}

export class CSV_response extends ServerEntity{

  constructor(){
    super();
  }

  total_inserted_rows:number = 0;
  total_errors_rows:number = 0;
  errors:string ='';

}
