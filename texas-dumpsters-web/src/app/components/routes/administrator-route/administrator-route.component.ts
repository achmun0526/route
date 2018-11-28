import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {MaterializeAction} from 'angular2-materialize';
import {PAGE_SIZE} from '../../../common/app-conf';
import {CsvFileComponent} from '../../common/csv-file/csv-file.component';
// import {SaveRouteComponent} from '../save-route/save-route.component';
import {Router, ActivatedRoute} from '@angular/router';
import {BaseComponent} from '../../../common/base-component';
import {RoutesService} from '../../../services/routes/routes.service';
import {Utils} from '../../../common/utils';
import {ServiceRoute} from "../../../model/route";
import {User} from "../../../model/user";
import {RouteItem} from "../../../model/routeItem";
import {AuthService} from "../../../services/auth/auth.service";
import {ROLE_NAMES} from "../../../common/app-conf";
import {Styles} from '../../../common/styles';
import {DriversService} from '../../../services/drivers/drivers.service';

@Component({
  selector: 'app-administrator-route',
  templateUrl: './administrator-route.component.html',
  styleUrls: ['./administrator-route.component.css']
})
export class AdministratorRouteComponent extends BaseComponent implements OnInit {

  private csv;
  private selectCompany;
  private selectedRoute: ServiceRoute = null;
  private pageInfo = {page: 1, page_size: PAGE_SIZE};
  private routeItemsList = [];
  private totalRouteItems = 0;
  private date = Utils.date2FormattedString(new Date(), 'MM/DD/YYYY');
  private currentUser = null;
  private driverRoutes;
  private driversList = null;
  private showDrivers = false;
  private currentDriver = null;
  private userRole;

  // Delete routes toasts
  private deleteRoutesToast = new EventEmitter<string | MaterializeAction>();
  private deleteRoutesToastError = new EventEmitter<string | MaterializeAction>();

  private addRouteModal = new EventEmitter<string | MaterializeAction>();
  private editRouteModal = new EventEmitter<string | MaterializeAction>();

  private status_enum = Object.keys(RouteItem.STATUS_ENUM).map(status => {
    return {
      num: status,
      name: RouteItem.STATUS_ENUM[status]
    }
  });

  // CSV modal
  @ViewChild(CsvFileComponent) CSVModal: CsvFileComponent;

  constructor(private router: Router, actRoute: ActivatedRoute, private routesService: RoutesService,
     private authService:AuthService, private driversService:DriversService) {
    super(actRoute);
    this.csv = {};
  }

  ngOnInit() {
    super.ngOnInit();
    this.getAllDrivers();
    this.checkUserRole();
  }
  /** This function checks the current user role to determine what to load on the page. **/
  checkUserRole() {
  /** Admin and dispatcher should be able to select a driver and a date, and see the available routes.
  Drivers should be able to see their personal routes. **/
    console.log("in checkUserRole");
    if(this.currentUser == null) {
      this.currentUser = this.authService.getCurrentUser();
      this.userRole = this.currentUser["roles"];
    }
  /** Below statements need to be changed if users will have more than one role. **/
    if(this.userRole[0] == ROLE_NAMES.DRIVER) {
  /** Load the driver's routes here. **/
      this.loadDriverRoutes();
    } else if(this.userRole[0] == ROLE_NAMES.ADMIN || this.userRole[0] == ROLE_NAMES.DISPATCHER) {
  /** Load drivers for company here. **/
      this.showDrivers = true;
  /** Check if a driver has already been selected. **/
      if(this.currentDriver == null) {
        console.log("Don't do anything until a driver is picked.");
      } else {
  /** Reload the routes for current date and current driver. **/
        this.driverChange(this.currentDriver);
      }
    } else {
      console.log("Looks like the user is not a driver, admin, nor a dispatcher.");
    }
  }

  /** Loads routes for the user/driver that is currently logged in. **/
  loadDriverRoutes() {
    console.log("in loadDriverRoutes");
    this.routesService.getRouteByUser(this.date).then(route => {
      this.selectedRoute = route;
      this.routesService.getRouteItemsByRoute(route.id).then((response: RouteItem[]) => {
        if (response == null) {
          response = [];
        }
        this.routeItemsList = response;
        this.totalRouteItems = this.routeItemsList.length;

      }).catch(err => {
        this.routeItemsList = [];
        this.totalRouteItems = 0;
      });
    });
  }

  /** Changes the status for a route item in the database when it is changed on the routes page. **/
  statusChange(routeItem: RouteItem) {
    this.routesService.setRouteItemStatus(routeItem.id, routeItem.status);
  }
  /** Updates the routes on the page when the driver is changed in the dropdown. **/
  driverChange(driver){
    console.log("loading driver routes");
  /** Clear the previous routeItems. **/
    this.routeItemsList = [];
    this.totalRouteItems = 0;
    this.currentDriver = driver;
    console.log(driver);
    this.routesService.getRoutesByCompanyOrDriverOrVehicle(this.pageInfo, null, driver, null, this.date, this.date).then(routes => {
      this.driverRoutes = routes;
      console.log(routes);
      for(let route of this.driverRoutes) {
        this.routesService.getRouteItemsByRoute(route.id).then((response: RouteItem[]) => {
          if(response == null) {
            response = [];
          }
          this.routeItemsList = response;
          this.totalRouteItems = this.routeItemsList.length;
        })
      }
    });
  }
  /** Gets all of the drivers for the current company. **/
  getAllDrivers() {
    console.log("Inside get all drivers")
    this.driversService.getDrivers(true,null).then(res => {
      this.driversList=JSON.parse(res);
      Styles.fixDropDownHeigh('smallDropdown', 5);
    });
  }

}
