import {isNullOrUndefined} from "util";
/**
 * Created by julianmontana on 1/26/17.
 */

export class ServerEntity{

  has_attachments:boolean=false;

  initEntity(){

  }

  parseServerResponse(response){
    if (!isNullOrUndefined(response)){
      for (var name of Reflect.ownKeys(this)) {
        var paramValue=Reflect.get(response,name);
        if (!isNullOrUndefined(paramValue)){
          Reflect.set(this,name,paramValue);
        }
      }
    }
  }

}
