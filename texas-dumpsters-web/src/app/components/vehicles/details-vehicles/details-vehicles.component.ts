import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { SaveVehiclesComponent} from "../save-vehicles/save-vehicles.component";
import { Router, ActivatedRoute, Params} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { AuthService } from '../../../services/auth/auth.service';
import { VehiclesService } from '../../../services/vehicles/vehicles.service';
import { Vehicle} from "../../../model/vehicle";

@Component({
  selector: 'app-details-vehicles',
  templateUrl: './details-vehicles.component.html',
  styleUrls: ['./details-vehicles.component.css']
})
export class DetailsVehiclesComponent extends BaseComponent implements OnInit {

	private vehicle;
	private selectCompany;
	// vehicle modal
	@ViewChild(SaveVehiclesComponent) vehiclesModal:SaveVehiclesComponent;

  constructor(activatedRoute:ActivatedRoute, private vehiclesService:VehiclesService, private authService:AuthService) {
		super(activatedRoute);
		this.vehicle = {};
		this.vehicle.driver = {};
	}

  ngOnInit() {
		super.ngOnInit();
		this.selectCompany = this.authService.getCurrentSelectedCompany();
		this.activatedRoute.params.switchMap((params: Params) => this.vehiclesService.getVehiclesId(params['id'])).
				subscribe((vehicleRes:Vehicle) => {
				this.vehicle = vehicleRes;
		});
  }


	editVehicles(){
		this.vehiclesModal.editVehicles(this.vehicle,this.selectCompany);
	}

}
