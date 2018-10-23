import {isNullOrUndefined} from "util";
import {KeyValueEntity} from "../model/key_value_entity";
import {DEV_API_KEY, LOCAL_API_KEY, PROD_API_KEY} from "./app-conf";
import {Order} from "../model/order";
import {startWith} from "rxjs/operator/startWith";

export class Utils {

  public static MONTH_LIST=[
    {name:'January',val:1},
    {name:'February',val:2},
    {name:'March',val:3},
    {name:'April',val:4},
    {name:'May',val:5},
    {name:'June',val:6},
    {name:'July',val:7},
    {name:'August',val:8},
    {name:'September',val:9},
    {name:'October',val:10},
    {name:'November',val:11},
    {name:'December',val:12},
  ];


  /**
   *
   *
   * */
  public static getScriptAsJSON(script):any{
    if (!isNullOrUndefined(script)){
      return JSON.parse(script);
    }
    return {};
  }

  /**
   *
   *
   * */
  public static isValidDropdown(field):boolean{
    if(isNullOrUndefined(field) || field===0 || field ===''){
      return false;
    }else{
      return true;
    }
  }

  /**
   *
   *
   * */
  public static findNameByIdOnKeyValueList(list:KeyValueEntity[],id):string{
    for (let item of list){
      if (item.id===id){
        return item.name;
      }
    }
    return '';
  }

  public static getNameFromVal(list,val):string{
    for (let item of list){
      if (item.val===val){
        return item.name;
      }
    }
    return '';
  }

  public static trimStringOnLength(string,length,concat){
    if (string.length<length){
      return string;
    }
    if (isNullOrUndefined(concat)){
      concat="";
    }
    return string.substr(0,length)+concat;
  }

  public static parseDate(date){
      if(date != null){
          var a = date.split(/[^0-9]/);
          //for (i=0;i<a.length;i++) { alert(a[i]); }
          return new Date (a[0],a[1]-1,a[2],a[3],a[4],a[5] );
      }else{
          return null;
      }
  }

  /**
   *
   * @param datetime String input format YYYY-MM-DD hh:mm:ss
   * output MM:DD:YYYY hh:mm:ss AM/PM
   */
  public static toAMPM(datetime){
    if(datetime instanceof Date){
      datetime = this.date2FormmatedString(datetime, "YYYY-MM-DD HH:mm:ss");
    }
    datetime = "" + datetime;
    var array = datetime.split(" ");

    var date = array[0];
    date = date.split("-");

    var year = parseInt(date[0]);
    var month = parseInt(date[1]);
    var day = parseInt(date[2]);

    var time = array[1];
    var time = time.split(":");

    var hour = parseInt(time[0]);
    var minutes = parseInt(time[1]);
    var seconds = parseInt(time[2]);

    var a = "AM";
    if(hour == 0){
      hour = 12;
      a = "AM";
    }
    if(hour==12){
      a = "PM";
    }
    if(hour > 12){
      hour -= 12;
      a = "PM";
    }
    return this.fixPadding(month) + "-" + this.fixPadding(day) + "-" + year + " " +
      this.fixPadding(hour) + ":" + this.fixPadding(minutes) + ":" + this.fixPadding(seconds) + " " + a;
  }

  public static formatDateToSlash(date){  //twice, one per each -
    date = date.replace("-","/");
    date = date.replace("-","/");
    return date;
  }

  static fixPadding(number){
    if(number < 10){
      return "0" + number;
    }else{
      return  "" + number;
    }
  }

  static date2FormmatedString(datetime:Date, format:String){
    var y = datetime.getFullYear();
    var M = datetime.getMonth()+1; //this fix becouse month starts in 0
    var d = datetime.getDate();
    var h= datetime.getHours();
    var m = datetime.getMinutes();
    var s = datetime.getSeconds();

    if(format=="YYYY-MM-DD HH:mm:ss"){
      return y + "-" + this.fixPadding(M) + "-" + this.fixPadding(d) + " " + this.fixPadding(h) + ":" + this.fixPadding(m) + ":" + this.fixPadding(s);
    }
    if(format=="YYYY/MM/DD HH:mm:ss"){
      return y + "/" + this.fixPadding(M) + "/" + this.fixPadding(d) + " " + this.fixPadding(h) + ":" + this.fixPadding(m) + ":" + this.fixPadding(s);
    }
    if(format=="MM/DD/YYYY"){
      return this.fixPadding(M) + "/" + this.fixPadding(d) + "/" + y;
    }
    if(format=="MM-DD-YYYY"){
      return this.fixPadding(M) + "-" + this.fixPadding(d) + "-" + y;
    }
  }

  static formattedString2Date(formattedDate:string, format:string){
    if(format == "MM-DD-YYYY"){
      var splitted = formattedDate.split('-');
      var month = parseInt(splitted[0]) - 1; //this needs to be substracted 1 to match the correct month.
      var day = parseInt(splitted[1]);
      var year = parseInt(splitted[2]);

      return new Date(year, month, day);
    }else{
      return null;
    }
  }

  /** Add x days to da date */
  static addDays(date, days){
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
  }

  /**** maakes a string from an array separating by custom separator */
  static array2stringBy(array, separator){
    if(array.length == 0){
      return "";
    }
    if(array.length == 1){
      return "" + array[0];
    }
    if(array.length > 0){
      var result = "" + array[0];
      for(var i=1; i<array.length; i++){
        result = result + separator + array[i];
      }
      return result;
    }
  }

  static setParameter(_data){
    var parameter = null;
    if(_data instanceof Array){
      if(_data.indexOf("all") > -1){
        parameter = null;
      }
      else{
        // build query array
        parameter = this.array2stringBy(_data, ",");
      }
    }
    if(_data instanceof String){
      if(_data == ""){
        parameter = null;
      }else{
        parameter = _data;
      }
    }
    return parameter;
  }

  public  static getAPI_KEY(){
    var origin= window.location.origin;
    switch (origin){
      case("https://texas-dumpsters-production.appspot.com"):
        return PROD_API_KEY;
      case("https://texas-dumpsters-development.appspot.com"):
          return DEV_API_KEY;
      default:
          return LOCAL_API_KEY;

    }
  }

  public static getIconForOrder(order:Order):string{
    var iconName = '';
    switch(order.purpose_of_service){
      case 1: iconName = 'order-delivery-'; break;
      case 2: iconName = 'order-removal-'; break;
      case 3: iconName = 'order-swap-'; break;
      case 4: iconName = 'order-relocate-'; break;
      default: iconName = '';
    }

    switch(order.state){
      case 1: iconName += 'red'; break;
      case 2: iconName += 'green'; break;
      case 3: iconName += 'orange'; break;
      case 4: iconName += 'yellow'; break;
      case 5: iconName += 'blue'; break;
      default: iconName += '';
    }
    iconName+=".png";
    return iconName;
  }

  public static SPIDERFY_ANGLE = 7 * Math.PI/18; // 70 degrees
  public static SPIDERFY_DEFAULT_AMPLITUDE = 0.05;
}
