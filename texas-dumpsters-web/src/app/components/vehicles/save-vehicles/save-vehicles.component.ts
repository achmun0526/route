import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { isNullOrUndefined} from "util";
import { Utils} from "../../../common/utils";
import { Styles } from "../../../common/styles";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { BaseComponent} from "../../../common/base-component";
import { ActivatedRoute} from "@angular/router";
import { VehiclesService } from '../../../services/vehicles/vehicles.service';
import { AuthService } from '../../../services/auth/auth.service';
import {ROLE_NAMES} from "../../../common/app-conf";

@Component({
  selector: 'app-save-vehicles',
  templateUrl: './save-vehicles.component.html',
  styleUrls: ['./save-vehicles.component.css']
})
export class SaveVehiclesComponent implements OnInit {

	@Output() reloadData = new EventEmitter();
	private vehicle;
	private userList = [];
	private title;
	private selectCompany;
	private validations={driver_invalid:true};

	//add vehicles modal
	private vehiclesModal = new EventEmitter<string|MaterializeAction>();
	//add vehicles toasts
	private addVehiclesToast = new EventEmitter<string|MaterializeAction>();
  private addVehiclesToastError = new EventEmitter<string|MaterializeAction>();
	//Delete vehicles toasts
	private deleteVehiclesToast = new EventEmitter<string|MaterializeAction>();
  private deleteVehiclesToastError = new EventEmitter<string|MaterializeAction>();

  constructor(private vehiclesService:VehiclesService, private authService:AuthService) {
		this.vehicle = {};
	}

  ngOnInit() {
		this.selectCompany = this.authService.getCurrentSelectedCompany();
		this.getDrivers();
  }

	/** save Vehicle function **/
	saveVehicle(){

		this.validations.driver_invalid = Utils.isValidDropdown(this.vehicle.driver_key);
		this.vehicle.active = true;
		if(this.validations.driver_invalid){
			this.vehiclesService.addVehicle(this.vehicle).then(res =>{
				if(res != null){
					this.addVehiclesToast.emit('toast');
					this.reloadData.emit();
				}else{
					this.addVehiclesToastError.emit('toast');
				}
				this.closeVehiclesModal();
			});
		}
	}

	 /**
   *
   * * list users function
   * **/
	getDrivers(){
		this.authService.getUsersByRole(ROLE_NAMES.DRIVER, false).then(res=>{
			this.userList = res.records;
			Styles.fixDropDownHeigh("smallDropdown", 5);
		});
	}

	/** edit customer function **/
	editVehicles(data,company){
		this.title = "Edit Data of " + company.name;
		this.vehicle = JSON.parse(JSON.stringify(data));
		this.openVehiclesModal();
	}

	/** delete customer function **/
	deleteVehicles(data){
		this.vehicle = data;
		this.vehicle.active = false;
		this.vehiclesService.addVehicle(this.vehicle).then(res =>{
			if(res != null){
				this.deleteVehiclesToast.emit('toast');
				this.reloadData.emit();
			}else{
				this.deleteVehiclesToastError.emit('toast');
			}
		});
	}

	/** add customer function **/
	addVehicles(data){
		this.title = "Add a Vehicle to " +  data.name;
		this.vehicle = {};
    this.validations={driver_invalid:true};
		this.vehicle.company_key = data.id;
		if(this.userList.length < 0){
			this.vehicle.driver_key = this.userList[0].user_key;
		}
		this.openVehiclesModal();
	}

	/** modals functions **/
	openVehiclesModal() {
    this.vehiclesModal.emit({action:"modal",params:['open']});
  }
  closeVehiclesModal() {
    this.vehiclesModal.emit({action:"modal",params:['close']});
  }


}
