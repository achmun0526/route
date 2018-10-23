import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import { MaterializeAction} from "angular2-materialize";
import { RoutesService } from '../../../services/routes/routes.service';
import { VehiclesService } from '../../../services/vehicles/vehicles.service';
import { AuthService } from '../../../services/auth/auth.service';
import {ROLE_NAMES} from "../../../common/app-conf";
import {BaseComponent} from "../../../common/base-component";
import {ActivatedRoute} from "@angular/router";
import {Utils} from "../../../common/utils";
import { Styles } from "../../../common/styles";
import {ServiceRoute} from "../../../model/route";

@Component({
	selector: 'app-save-route',
	templateUrl: './save-route.component.html',
	styleUrls: ['./save-route.component.css']
})
export class SaveRouteComponent extends BaseComponent implements OnInit {

	//This parameter is used when the component is used on edit mode
	@Input() routeToEdit;
	@Output() afterSaveCompleted = new EventEmitter();
	@Output() onCancelAction = new EventEmitter();
	private selectedVehicleIndex;
	private title = "Add Route";
	private isOnEditMode=false;
	private route;
	private date;
	private userList = [];
	private dayList = [];
	private yearList = [];
	private vehiclesList = [];
	private hourList = [];
	private minuteList = [];
	private secondList = [];
	private hour_type = 'AM/PM'; // AM/PM or 24H

	//add routes modal
	private routesModal = new EventEmitter<string|MaterializeAction>();
	//add routes toasts
	private addRoutesToast = new EventEmitter<string|MaterializeAction>();
	private addRoutesToastError = new EventEmitter<string|MaterializeAction>();

	private validations={vehicle_valid:true,driver_valid:true};

	constructor(activatedRoute:ActivatedRoute,private routesService:RoutesService, private vehiclesService:VehiclesService, private authService:AuthService) {
		super(activatedRoute);
		this.route = {vehicle_key:"",driver_key:''};
		this.date = {}
	}

	ngOnInit() {
		if (!this.isNullOrUndefined(this.routeToEdit)){
			this.setupEdit();
		}else{
			this.setupCreate();
		}
		this.getVehicles();
		this.getDrivers();
	}

	setupCreate(){
		this.route.company_key = this.authService.getCurrentSelectedCompany().id;
		this.title = "Add Route ";

		this.date.hour_type = 1;
		this.date.hour = 1;
		this.date.minutes = 0;
	}

	setupEdit(){
		this.isOnEditMode=true;
		this.title = "Edit Route for "+this.routeToEdit.vehicle.vehicle_name+" and "+this.routeToEdit.driver.first_name+" "+this.routeToEdit.driver.last_name;
		this.route=this.routeToEdit;

		var dateArray = this.route.date.split(" ");
		var date = dateArray[0];
		date = date.split("-");
		var y = date[0];
		var m = date[1];
		var d = date[2];
		this.date.date = "" + m + "/" + d + "/" + y;

		var time = dateArray[1];
		time = time.split(':');
		this.date.hour = parseInt(time[0]);
		this.date.minutes = parseInt(time[1]);

		if(this.date.hour == 0){ //12 AM
			this.date.hour = 12;
			this.date.hour_type = 1;
		}else if(this.date.hour > 0 && this.date.hour < 12){
			this.date.hour_type = 1;
		}else if(this.date.hour == 12){ //12 PM
			this.date.hour_type = 2;
		}else if(this.date.hour > 12 && this.date.hour < 24){
			this.date.hour = this.date.hour - 12;
			this.date.hour_type = 2;
		}
	}



	/**get vehicles**/
	getVehicles(){
		this.vehiclesService.getVehicles(null).then(res =>{
			this.vehiclesList = res.records;
			Styles.fixDropDownHeigh("smallDropdown", 5);
			if (this.isOnEditMode){
			  	for (var i=0; i<this.vehiclesList.length;i++){
			   		if (this.vehiclesList[i].id===this.route.vehicle_key){
            			this.selectedVehicleIndex=i;
            			break;
          			}
        		}
      		}
		});
	}

	/** list users function**/
	getDrivers(){
		this.authService.getUsersByRole(ROLE_NAMES.DRIVER, true).then(res=>{
			this.userList = res.records;
			Styles.fixDropDownHeigh("smallDropdown", 5);
		});
	}

	onVehicleChanged(){
		this.route.vehicle_key=this.vehiclesList[this.selectedVehicleIndex].id;
		this.route.driver_key=this.vehiclesList[this.selectedVehicleIndex].driver.user_key;
	}

	/** save Routes function **/
	// saveRoutes(){
	//   	this.validations.vehicle_valid=Utils.isValidDropdown(this.route.vehicle_key);
  //   	this.validations.driver_valid=Utils.isValidDropdown(this.route.driver_key);
	//   	if (!this.validations.vehicle_valid || ! this.validations.driver_valid){
	// 		return;
	// 	}
	// 	//this.generateDate();
	// 	this.joinDateToTime();
	// 	this.route.date = this.date.fullDate;
	// 	this.routesService.addRoute(true,this.route).then(res =>{
	// 		if(res != null){
	// 			this.addRoutesToast.emit('toast');
	// 			this.afterSaveCompleted.emit();
	// 		}else{
	// 			this.addRoutesToastError.emit('toast');
	// 		}
	// 	});
	// }

	/** add routes function **/
	addRoutes(data){
		this.title = "Add a Route to " +  data.name;
		this.route = {};
		//this.generateList();
		this.joinDateToTime();

		if(this.vehiclesList.length > 0){
			this.route.vehicleOn = 0;
		}

		this.route.company_key = data.id
	}

	/** edit activatedRoute function **/
	editRoutes(data,company){
		this.title = "Edit Data of " + company.name;
		this.route = data;
		//this.displayed = false;
		var dateArray = data.date.split(" ");
		var date = dateArray[0].split('-');
		this.date.year = date[0];

		this.date.month = parseInt(date[1]);

		this.date.day = parseInt(date[2]);
	}

	joinDateToTime(){

		var h = parseInt(this.date.hour);
		var m = parseInt(this.date.minutes);
		var s = "00";
		//hour_type: 1 AM, 2 PM
		if(this.date.hour_type==2 && h<12){
			h = h + 12;
		}
		if(this.date.hour_type==1 && h == 12){
			h = 0;
		}

		this.date.fullDate =
			this.date.date +
			" " +
			( (h < 10)? "0" + h : "" + h ) +
			":" +
			( (m < 10)? "0" + m : "" + m ) +
			':' +
			s;
	}

	hourConfig(){
		this.date.hour_type = this.date.hour_type;
	}
}
