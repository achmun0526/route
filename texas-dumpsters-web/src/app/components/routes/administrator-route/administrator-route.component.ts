import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { CsvFileComponent} from "../../common/csv-file/csv-file.component";
import { SaveRouteComponent} from "../save-route/save-route.component";
import {Router, ActivatedRoute, Route} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { RoutesService } from '../../../services/routes/routes.service';
import {Utils} from "../../../common/utils";

@Component({
  selector: 'app-administrator-route',
  templateUrl: './administrator-route.component.html',
  styleUrls: ['./administrator-route.component.css']
})
export class AdministratorRouteComponent extends BaseComponent implements OnInit {

	private csv;
	private selectCompany;
	private selectedRoute:Route=null;
	private pageInfo = {page:1,page_size:PAGE_SIZE};
	private routesList = [];
	private totalRoutes = 0;
  //Delete routes toasts
  private deleteRoutesToast = new EventEmitter<string|MaterializeAction>();
  private deleteRoutesToastError = new EventEmitter<string|MaterializeAction>();

  private addRouteModal = new EventEmitter<string|MaterializeAction>();
  private editRouteModal = new EventEmitter<string|MaterializeAction>();

	// CSV modal
	@ViewChild(CsvFileComponent) CSVModal:CsvFileComponent;

  constructor(private router:Router, actRoute:ActivatedRoute,private routesService:RoutesService) {
		super(actRoute);
		this.csv = {};
	}

  ngOnInit() {
		super.ngOnInit();
		this.getRoutes();
  }

	/** Go to details of the routes **/
	goToRouteDetails(data){
		this.router.navigate(["/management/routes", data.id]);
	}

  /***
   * Deletes the selected activatedRoute
   *
   * **/
  deleteRoute(selectedRoute){
    this.routesService.deleteRoute(selectedRoute.id).then(res =>{
      if(res != null){
        this.deleteRoutesToast.emit('toast');
        this.pageInfo.page=1;
        this.getRoutes();
      }else{
        this.deleteRoutesToastError.emit('toast');
      }
    });
  }

  /**
   *
   *
   * */
  openEditRouteModal(route){
    //this.UserModal.editUser(user);
    this.selectedRoute=route;
    //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    setTimeout(() => {
      this.editRouteModal.emit({action:'modal',params:['open']});
    }, 100);
  }

	/** open modal to add a routes **/
	addCVSfile(){
		this.csv.company_key = this.selectCompany.id;
		this.CSVModal.addCVSfile(this.csv);
	}

	/**get Routes**/
	getRoutes(){
		this.routesService.getAllRoutes(this.pageInfo, true).then(res =>{
      this.routesList = res.records;
			this.totalRoutes= res.total_records;
		});
	}

	/** Load data of new page **/
	changePage(page) {
    this.pageInfo.page = page+1;
    this.getRoutes();
  }

  onRouteCreated(){
    this.addRouteModal.emit({action:'modal',params:['close']});
    this.selectedRoute = null;
    this.getRoutes();
  }

  closeAddRuteModal(){
    this.addRouteModal.emit({action:'modal',params:['close']})
    this.selectedRoute = null;
  }

  onRouteUpdated(){
    this.editRouteModal.emit({action:'modal',params:['close']});
    this.getRoutes();
    this.selectedRoute = null;
  }

  onRouteEditCancelled(){
    this.editRouteModal.emit({action:'modal',params:['close']});
    this.selectedRoute=null;
  }
}