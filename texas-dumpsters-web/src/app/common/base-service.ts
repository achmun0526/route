import {PaginationResponse} from "../model/pagination_response";
import {isNullOrUndefined} from "util";
import {ServerEntity} from "./server_entity";
export class BaseService {
  static callCounter=0;
  static timeOut;
  constructor() {}

  protected showSpinner(){
    if (BaseService.timeOut){
      clearTimeout(BaseService.timeOut);
    }
		$('#load-screen').fadeIn( "slow" );
		BaseService.callCounter++;
  }

  protected hideSpinner(){
		BaseService.callCounter--;
    //In order to avoid flashing we give 100 ms and wait to another calls to be made
    BaseService.timeOut=setTimeout(function(){
        if (BaseService.callCounter<=0){
      $('#load-screen').fadeOut( "slow" );
      }
    },100);

  }

  /**
   *
   * */
  protected handleError(error: any): Promise<any> {
    console.log(error);
    //this.hideSpinner();
    $('#load-screen').fadeOut( "slow" );
    return Promise.reject(error.message || error);
  }

  /**
   *
   * */
  protected getPagingInfoAsURLParams(currentParams,pagingInfo):String{
    if (pagingInfo!=null){
      if (currentParams===''){
        return '?page='+pagingInfo.page+'&page_size='+pagingInfo.page_size;
      }else{
        return currentParams+'&page='+pagingInfo.page+'&page_size='+pagingInfo.page_size;
      }
    }else{
      return currentParams;
    }
  }

  /**
   *
   * */
  protected getFilterAsUrlParams(currentParams,filter):String{
    var res:String=currentParams;
    for (var name of Reflect.ownKeys(filter)) {
      var paramValue=Reflect.get(filter,name);
      if (!isNullOrUndefined(paramValue) && paramValue!=''){
        var paramString=name.toString()+'='+paramValue;
        if (res===''){
          res='?'+paramString;
        }else{
          res+='&'+paramString;
        }
      }
    }
    return res;
  }

  /**
   *
   *
   * */
  protected parsePaginationResponse(res,entity):PaginationResponse{
    var temp:PaginationResponse=new PaginationResponse();
    temp.records=this.parseMultipleItems(res.response.records?res.response.records:res.response.tasks,entity);
    if (res.response.total instanceof Array){
      temp.total_records=res.response.total[0];
    }else{
      temp.total_records=res.response.total;
    }
    return temp;
  }

  /**
   *
   * */
  protected parseMultipleItems(items,entity):ServerEntity[]{
    var tempEntity:ServerEntity;
    var array:ServerEntity[]=[];
    if (!isNullOrUndefined(items)){
      for (let singleRes of items){
        tempEntity=Reflect.construct(entity,[]);
        tempEntity.initEntity();
        tempEntity.parseServerResponse(singleRes);
        array.push(tempEntity);
      }
    }
    return array;
  }

}
