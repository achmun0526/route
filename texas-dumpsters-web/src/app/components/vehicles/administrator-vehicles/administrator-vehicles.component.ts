import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { CsvFileComponent} from "../../common/csv-file/csv-file.component";
import { SaveVehiclesComponent} from "../save-vehicles/save-vehicles.component";
import { Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { AuthService } from '../../../services/auth/auth.service';
import { VehiclesService } from '../../../services/vehicles/vehicles.service';

@Component({
  selector: 'app-administrator-vehicles',
  templateUrl: './administrator-vehicles.component.html',
  styleUrls: ['./administrator-vehicles.component.css']
})
export class AdministratorVehiclesComponent extends BaseComponent implements OnInit {

	private vehiclesList = [];
	private csv;
	private selectCompany;
	private totalVehicles = 0;
	private pageInfo = {page:1,page_size:PAGE_SIZE};

	// vehicle modal
	@ViewChild(SaveVehiclesComponent) vehiclesModal:SaveVehiclesComponent;
	// CSV modal
	@ViewChild(CsvFileComponent) CSVModal:CsvFileComponent;

  constructor(private router:Router, actRoute:ActivatedRoute, private authService:AuthService, private vehiclesService:VehiclesService) {
		super(actRoute);
		this.csv = {};
	}

  ngOnInit() {
		super.ngOnInit();
		this.getVehicles();
		this.selectCompany = this.authService.getCurrentSelectedCompany();
  }

	/** Go to details of the vehicle **/
	detailsVehicles(data){
		this.router.navigate(["/settings/vehicles_details", data.id]);
	}
	/** open modal to edit a vehicles **/
	editVehicles(data){
		this.vehiclesModal.editVehicles(data,this.selectCompany);
	}

	/** open modal to delete a vehicles **/
	deleteVehicles(data){
		this.vehiclesModal.deleteVehicles(data);
	}

	/** open modal to add a vehicles **/
	addVehicles(){
		this.vehiclesModal.addVehicles(this.selectCompany);
	}

	/** open modal to add a vehicles **/
	addCVSfile(){
		this.csv.company_key = this.selectCompany.id;
		this.CSVModal.addCVSfile(this.csv);
	}

	/**get vehicles**/
	getVehicles(){
		this.vehiclesService.getVehicles(this.pageInfo).then(res =>{
			this.vehiclesList = res.records;
			this.totalVehicles= res.total_records;
		});
	}

	/** Load data of new page **/
	changePage(page) {
    this.pageInfo.page = page+1;
    this.getVehicles();
  }


}
