import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { isNullOrUndefined} from "util";
// import { Utils} from "../../../common/utils";
// import { Styles } from "../../../common/styles";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { BaseComponent} from "../../../common/base-component";
import { ActivatedRoute} from "@angular/router";
import { DriversService } from '../../../services/drivers/drivers.service';
// import { AuthService } from '../../../services/auth/auth.service';
import { SharedService } from '../../../services/shared/shared.service';
// import {ROLE_NAMES} from "../../../common/app-conf";

@Component({
  selector: 'app-save-drivers',
  templateUrl: './save-drivers.component.html',
  styleUrls: ['./save-drivers.component.css']
})
export class SaveDriversComponent extends BaseComponent implements OnInit {

  @Output() reloadData = new EventEmitter();
	private driver;

	private title;
	private selectedCompany;

	private userList = [];
	//add Drivers modal
	private driversModal = new EventEmitter<string|MaterializeAction>();
	//add Drivers toasts
	private addDriversToast = new EventEmitter<string|MaterializeAction>();
  private addDriversToastError = new EventEmitter<string|MaterializeAction>();
	//Delete Drivers toasts
	private deleteDriversToast = new EventEmitter<string|MaterializeAction>();
  private deleteDriversToastError = new EventEmitter<string|MaterializeAction>();

  constructor(activatedRoute:ActivatedRoute,private driversService:DriversService, private sharedService:SharedService) {
    super(activatedRoute);
		this.driver= {};
	}

  ngOnInit() {
  }

	/** save drivers function **/
	saveDriver(){
    console.log("inside saveDriver in save-driver modal");
    this.driver.driver_operational="active";
    this.driver.active=true;
    console.log(this.driver);
			this.driversService.saveDriver(this.driver).then(res =>{
				if(res != null){
					this.addDriversToast.emit('toast');
					this.reloadData.emit();
				}else{
					this.addDriversToastError.emit('toast');
				}
				this.closeDriversModal();
			});
	}

	 /**
   *
   * * list users function
   * **/
	// getDrivers(){
	// 	this.authService.getUsersByRole(ROLE_NAMES.DRIVER, false).then(res=>{
	// 		this.userList = res.records;
	// 		Styles.fixDropDownHeigh("smallDropdown", 5);
	// 	});
	// }

	/** edit customer function **/
	editDriver(data,company){
		this.title = "Edit Data of " + company.name;
		this.driver = JSON.parse(JSON.stringify(data));
    this.driver.driver_operational="active";
		this.openDriversModal();
	}

	/** delete customer function **/
	deleteDriver(data){
		this.driver = data;
		this.driver.active = false;
		this.driversService.saveDriver(this.driver).then(res =>{
			if(res != null){
				this.deleteDriversToast.emit('toast');
				this.reloadData.emit();
			}else{
				this.deleteDriversToastError.emit('toast');
			}
		});
	}

	/** add customer function **/
	addDriver(data){
		this.title = "Add a Driver to " +  data.name;
		this.driver = {};
		this.driver.company_key = data.id;
		if(this.userList.length < 0){
			this.driver.driver_key = this.userList[0].user_key;
		}
		this.openDriversModal();
	}

	/** modals functions **/
	openDriversModal() {
    this.driversModal.emit({action:"modal",params:['open']});
  }
  closeDriversModal() {
    this.driversModal.emit({action:"modal",params:['close']});
  }

}
