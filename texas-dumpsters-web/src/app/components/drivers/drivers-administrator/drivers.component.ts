import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { CsvFileComponent} from "../../common/csv-file/csv-file.component";
import { SaveDriversComponent} from "../save-drivers/save-drivers.component";
import { Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { AuthService } from '../../../services/auth/auth.service';
import { DriversService } from '../../../services/drivers/drivers.service';

@Component({
  selector: 'app-drivers',
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.css']
})
export class DriversComponent extends BaseComponent implements OnInit {

  private driversList = [];
  private driversDisplayList=[];
  private driver_operational_list=[];
	private csv;
	private selectCompany;
	private totalDrivers = 0;
	private pageInfo = {page:1,page_size:PAGE_SIZE};


	// vehicle modal
	@ViewChild(SaveDriversComponent) driversModal:SaveDriversComponent;
	// CSV modal
	@ViewChild(CsvFileComponent) CSVModal:CsvFileComponent;

  constructor(private router:Router, actRoute:ActivatedRoute, private authService:AuthService, private driversService:DriversService) {
		super(actRoute);
		this.csv = {};
    this.selectCompany = this.authService.getCurrentSelectedCompany();
	}
  ngOnInit() {
    console.log("inside the Drivers Component")
    super.ngOnInit();
    this.getDrivers(true);
  }

  /** Go to details of the vehicle **/
  detailsDrivers(data){
    this.router.navigate(["/settings/drivers_details", data.id]);
  }
  /** open modal to edit a vehicles **/
  editDrivers(data){
    console.log("logging the data inside editDrivers");
    console.log(data);
    // setTimeout(() => {
    //   this.editDriversModal.emit({action:'modal',params:['open']});
    // }, 350);
    setTimeout(() => {
      this.driversModal.editDriver(data,this.selectCompany);
    }, 350);
  }

  /** open modal to delete a vehicles **/
  deleteDriver(data){
    this.driversService.deleteDriver(data.id).then(res =>{
        if(res != null){
          console.log(res);
        //   this.deleteDriverToast.emit('toast');
          this.getDrivers(true);
        // }else{
        //   this.deleteDriverToastError.emit('toast');
        }
      });
  }


  /** open modal to add a vehicles **/
  addDriver(){
    this.driversModal.addDriver(this.selectCompany);
  }

  /** open modal to add a vehicles **/
  addCVSfile(){
    this.csv.company_key = this.selectCompany.id;
    this.CSVModal.addCVSfile(this.csv);
  }

  /**get vehicles**/
  getDrivers(overwrite){
    console.log("inside getDrivers");
    this.driversService.getDrivers(overwrite,null).then(res =>{
      this.driversList = JSON.parse(res);
      this.driversDisplayList=this.driversList.slice(0,10);
      console.log(this.driversList);
      this.totalDrivers= this.driversList.length;
      for(let i=0;i<this.totalDrivers;i++){
        this.driver_operational_list[i]=this.driversList[i].driver_operational;
      }
      console.log(this.driver_operational_list);
    });

  }



  // Changes page at bottom of the orders list
    changePage(page) {
        this.pageInfo.page = page+1;
        var start_pos = (this.pageInfo.page-1)*10;
        var end_pos = start_pos+10;
        if(end_pos>this.totalDrivers){
          this.driversDisplayList=this.driversList.slice(start_pos,this.totalDrivers);
        }else{
          this.driversDisplayList=this.driversList.slice(start_pos,end_pos);
        }
  	  }

  activate_driver(item_number){
    console.log("inside activate_driver");
    let driver = this.driversList[item_number];
    this.driversList[item_number].driver_operational="active";
    this.driver_operational_list[item_number]="active";
    console.log(this.driver_operational_list);
    driver.driver_operational = "active";
    console.log("logging the driver ");
    console.log(driver);
    this.saveDriver(driver);
  }

  deactivate_driver(item_number){
    console.log("inside deactivate driver");
    let driver = this.driversList[item_number];
    this.driversList[item_number].driver_operational="not_active";
    this.driver_operational_list[item_number]="not_active";
    console.log(this.driver_operational_list);
    driver.driver_operational ="not_active";
    console.log("logging the driver ");
    console.log(driver);
    this.saveDriver(driver);
  }

  saveDriver(driver){
      this.driversService.saveDriver(driver).then(res =>{
        if(res != null){
          console.log(res);
        }
      });


  }

}
