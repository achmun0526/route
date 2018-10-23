import { Pipe, PipeTransform } from '@angular/core';

const PADDING = "000000";

@Pipe({
  name: 'phoneNumber'
})
export class PhoneNumberPipe implements PipeTransform {
	
  private separator: string;
	replace;

  constructor() {
		this.separator = "-"
  }

  transform(value, fractionSize: number = 2): string {
		 
		let [ integer, fraction = "" ] = (value || "").toString().split(".");
		integer = integer.replace(/\D/g, "");
		value = integer;
		//value = this.replaceAll("-", "", false);
		var one = value.slice(0,3);
		var two = value.slice(3,6);
		var three = value.slice(6,10);
		var four = value.slice(10,15);
		var result = "";
		if(value.length > 10){
			result = "(" + one + ")" + "-" + two + "-" + three + " ext " + four;
		}
		else{
			result = "(" + one + ")" + "-" + two + "-" + three ;
		}
		if(result == "()--" || result == "()-- ext "){
			result = "";	
			return result;
		}else{
			return result;
		}
		
  }
}
