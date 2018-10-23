import { Injectable } from '@angular/core';
import {Attachment} from "../../model/attachment";
import {BaseService} from "../../common/base-service";
import {GET_ATTACHMENTS_URL, SUCCESS} from "../../common/app-conf";
import {Http} from "@angular/http";

@Injectable()
export class AttachmentsService extends BaseService{

  constructor(private http:Http) {
    super();
  }

  /**
   *
   *
   * */
  public getAttachmentsByEntityId(entityId:string):Promise<Attachment[]>{
    return this.http.get(GET_ATTACHMENTS_URL+"?entity_key="+entityId).toPromise()
      .then(response => {
        var res=response.json();
        if (res.status===SUCCESS){
          return <Attachment[]>super.parseMultipleItems(res.response,Attachment);
        }else{
          return [];
        }
      })
      .catch(this.handleError);
  }
}
