import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SharedService } from '../../../services/shared/shared.service';
import {AuthService} from "../../../services/auth/auth.service";

@Component({
  selector: 'app-search-address',
  templateUrl: './search-address.component.html',
  styleUrls: ['./search-address.component.css']
})
export class SearchAddressComponent implements OnInit {

	@Output() getAddress = new EventEmitter();
	@Output() getCity = new EventEmitter();
	@Output() getState = new EventEmitter();
	@Output() getzip_code = new EventEmitter();
	@Output() getLatitude = new EventEmitter();
	@Output() getLongitude = new EventEmitter();

	@Input() initialValue;

	private addressesList =[];
	private listDisplay = true;
	private address;
	private addressModel;

	constructor(private sharedService:SharedService,private authService:AuthService) {
		this.address = {};
	}

	ngOnInit() {
		this.addressModel=this.initialValue;
	}

	/** get the address list**/

	search(model){
		let timeoutId = setTimeout(() => {
			this.listDisplay = true;
			if(model == this.addressModel && model != ""){
				this.sharedService.geoReverseAddress(model).then(res =>{
					this.addressesList = res;
          console.log(res);
				});
			}
			}, 1000);
	}

	updateModel(val){
		var dat = this.addressesList[val].address_components;
    console.log(JSON.stringify(dat));
		var longAddress = '';
		for (var i = 0; i < dat.length; i ++){

			var row = dat[i];
			var type = row.types[0];

			switch(type){
				case "street_number": longAddress = row.long_name; break;
				case "route": this.addressModel	= longAddress + " " + row.long_name; break;
				case "postal_code": this.address.zip_code = row.long_name; break;
				case "locality": this.address.city 		= row.long_name; break;
				case "administrative_area_level_1":	this.address.state = row.long_name; break;
			}
		}
		this.getAddress.emit(this.addressModel);
		this.getCity.emit(this.address.city);
		this.getState.emit(this.address.state);
		this.getzip_code.emit(this.address.zip_code);
		this.getLatitude.emit(this.addressesList[val].geometry.location.lat+'');
		this.getLongitude.emit(this.addressesList[val].geometry.location.lng+'')
	}

	hidden(){
		let timeoutId = setTimeout(() => {
			this.listDisplay = false;
		},1000)
	}

	modelChange(addModel){
		this.search(addModel);
		this.getAddress.emit(addModel)
	}

}
