// Core
import {MaterializeDirective, MaterializeAction} from 'angular2-materialize';
import {PAGE_SIZE, ROLE_NAMES, ASSETS_URL,ASSET_SIZE_LIST,PURPOSE_OF_SERVICE_LIST} from '../../common/app-conf';
import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {Router, ActivatedRoute, Route} from '@angular/router';
import {Utils} from '../../common/utils';
import {Styles} from '../../common/styles';
import {isNullOrUndefined} from 'util';

// Components
import {BaseComponent} from '../../common/base-component';
import {MapHandlerComponent} from '../common/map-handler/map-handler.component';
import {AssetsInventoryComponent} from '../assets/assets-inventory/assets-inventory.component';

// Services
import {RoutesService} from '../../services/routes/routes.service';
import {AuthService} from '../../services/auth/auth.service';
import {VehiclesService} from '../../services/vehicles/vehicles.service';
import {OrdersService} from '../../services/orders/orders.service';
import {SharedService} from '../../services/shared/shared.service';
import {YardsService} from '../../services/yards/yards.service';
import {FacilitiesService} from '../../services/facilities/facilities.service';
import {CompaniesService} from '../../services/companies/companies.service';

// Models
import {ServiceRoute} from '../../model/route';
import {KeyValueEntity} from '../../model/key_value_entity';
import {CustomLatLng} from '../../model/custom_lat_lng';
import {RouteItem} from '../../model/routeItem';
import {Order} from '../../model/order';

declare var $: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']

})

export class DashboardComponent extends BaseComponent implements OnInit {

  private pageInfo = {page: 1, page_size: PAGE_SIZE};

  protected companyList = [];
  protected driverList = [];
  protected vehicleList = [];


  protected selectedCompany: any;
  private selectedCompany_before = [];

  protected selectedVehicle: any;
  private selectedVehicle_before = [];

  protected selectedDriver: any;
  protected selectedDriver_before = [];

  public startDate: any;
  public endDate: any;

  protected routesTest: ServiceRoute = new ServiceRoute;
  protected routeItemsList = [];
  protected routesList = [];
  protected ordersList = [];
  protected totalRoutes = 0;
  protected rawRouteItems = new RouteItem;
  protected rawRoute = new ServiceRoute;

  driver: string;
  vehicle: string;

  selectedValue: string;
  totalOrders: number;

  private firstLoad = true;
  private firstLoadOrders = true;

  public purposeServiceList: KeyValueEntity[] = [];
  public orderStateList: KeyValueEntity[] = [];
  public assetsSizeList: KeyValueEntity[] = [];

  public filterToastError = new EventEmitter<string | MaterializeAction>();
  public routeNoItemsToastError = new EventEmitter<string | MaterializeAction>();

  @ViewChild(MapHandlerComponent) mapHandler: MapHandlerComponent;

  protected enableCompanyDD = true;
  protected enableDriverDD = true;
  protected enableVehicleDD = true;

  constructor(private router: Router, route: ActivatedRoute, private routesService: RoutesService,
    public authService: AuthService, private vehiclesService: VehiclesService,
    private ordersService: OrdersService, private sharedService: SharedService,
    private yardsService: YardsService, private facilitiesService: FacilitiesService,
    private companiesService: CompaniesService) {
    super(route);
  }

  ngOnInit() {
    super.ngOnInit();
    // this.ordersService.getPurposeOfServiceList().then(res => this.purposeServiceList = res);
    // this.ordersService.getOrderStateList().then(res => this.orderStateList = res);
    // this.ordersService.getAssetsSizeList().then(res => this.assetsSizeList = res);
    // this.selectedCompany = null; this.authService.getCurrentSelectedCompany().id;
    // this.selectedCompany = []; // set selected company what user belongs
    // this.selectedCompany.push(this.authService.getCurrentSelectedCompany().id);
    // this.selectedDriver = null;
    // this.selectedVehicle = null;
    // Set start and end dates to same day
    this.startDate = Utils.date2FormmatedString(new Date(), 'MM-DD-YYYY');
    this.endDate = Utils.date2FormmatedString(new Date(), 'MM-DD-YYYY');
    // At the begining filters are set to all possible values after that it filters
    this.getAllCompanies();
    this.getAllDrivers();
    this.getAllVehicles();
    this.filterRoutes();
  }

  getAllCompanies() {
    this.companiesService.getCompaniesByUser(null).then(res => {
      this.companyList = JSON.parse(res);
      // this.selectedCompany = this.authService.getCurrentSelectedCompany();
      Styles.fixDropDownHeigh('smallDropdown', 5);
    });
  }
  getAllDrivers() {
    this.authService.getAllUsersByRole_superAdmin(ROLE_NAMES.DRIVER).then(res => {
      this.driverList = res.records;
      Styles.fixDropDownHeigh('smallDropdown', 5);
    });
  }
  getAllVehicles() {
    this.vehiclesService.getAllVehicles_superAdmin(null).then(res => {
      this.vehicleList = res.records;
      Styles.fixDropDownHeigh('smallDropdown', 5);
    });
  }
  getDriversByCompany(companyId) {
    this.authService.getUsersByRoleAndCompany_superAdmin(ROLE_NAMES.DRIVER, companyId).then(res => {
      this.driverList = res.records;
      Styles.fixDropDownHeigh('smallDropdown', 5);
    });
  }
  getVehiclesByDriver(driverId) {
    this.vehiclesService.getVehiclesByDriver_superAdmin(driverId).then(res => {
      this.vehicleList = res.records;
      Styles.fixDropDownHeigh('smallDropdown', 5);
    });
  }

  // Actions when a filter changes
  companyFilterChanged($event) {
    if ((this.selectedCompany.indexOf('all') > -1) && !(this.selectedCompany_before.indexOf('all') > -1)) {
      this.selectedCompany = ['all'];
    } else {
      for (let i = this.selectedCompany.length - 1; i--;) {
        if (this.selectedCompany[i] === 'all') {
          this.selectedCompany.splice(i, 1);
        }
      }
    }

    this.selectedCompany_before = this.selectedCompany;

    this.enableCompanyDD = false;
    setTimeout(() => {
      this.enableCompanyDD = true;
    }, 100);
  }
  driverFilterChanged(driverId) {
    if ((this.selectedDriver.indexOf('all') > -1) && !(this.selectedDriver_before.indexOf('all') > -1)) {
      this.selectedDriver = ['all'];
    } else {
      for (let i = this.selectedDriver.length - 1; i--;) {
        if (this.selectedDriver[i] === 'all') {
          this.selectedDriver.splice(i, 1);
        }
      }
    }

    this.selectedDriver_before = this.selectedDriver;

    this.enableDriverDD = false;
    setTimeout(() => {
      this.enableDriverDD = true;
    }, 100);
    /*
    if(driverId != 'all'){
        this.getVehiclesByDriver(driverId);
    }else{
        this.getAllVehicles();
    }*/
  }
  vehicleFilterChanged(vehicleId) {
    if ((this.selectedVehicle.indexOf('all') > -1) && !(this.selectedVehicle_before.indexOf('all') > -1)) {
      this.selectedVehicle = ['all'];
    } else {
      for (let i = this.selectedVehicle.length - 1; i--;) {
        if (this.selectedVehicle[i] === 'all') {
          this.selectedVehicle.splice(i, 1);
        }
      }
    }

    this.selectedVehicle_before = this.selectedVehicle;

    this.enableVehicleDD = false;
    setTimeout(() => {
      this.enableVehicleDD = true;
    }, 100);
  }

  filterRoutes() {
    let begining_date = Utils.formattedString2Date(this.startDate, 'MM-DD-YYYY');
    let finish_date = Utils.formattedString2Date(this.endDate, 'MM-DD-YYYY');
    if ((finish_date.getTime() >= begining_date.getTime())) {
      this.loadRoutes();
    } else {
      this.filterToastError.emit('toast');
    }
  }

  loadRoutes() {
    console.log("in LoadRoutes")
    let f_startDate = null;
    let f_endDate = null;

    f_startDate = Utils.formatDateToSlash(this.startDate);
    f_endDate = Utils.formatDateToSlash(this.endDate);

    let f_company = Utils.setParameter(this.selectedCompany);
    let f_driver = Utils.setParameter(this.selectedDriver);
    let f_vehicle = null;
    // let f_vehicle = Utils.setParameter(this.selectedVehicle);

    this.routesService.getRoutesByCompanyOrDriverOrVehicle(null, f_company, f_driver, f_vehicle, f_startDate, f_endDate).then(res => {
        this.routesList = res;
        this.totalRoutes = this.routesList.length;
        for(let i=0;i<this.totalRoutes;i++){
          this.routesList[i]["display"]=false;
          //console.log("before routesTest");
          //this.routesTest.parseServerResponse(res);
          //console.log("after routes test");
          //console.log(this.routesTest);
        }
        console.log(this.routesList);
    });
  }



  /** Go to details of the routes **/
  goToRouteDetails(data) {
    this.router.navigate(['/management/routes', data.id]);
  }

  ////////////////////////////////////////////////////////////
  ////////////  Orders ///////////////////////////////////////
  ////////////////////////////////////////////////////////////

  filterOrders() {
    let begining_date = Utils.formattedString2Date(this.startDate, 'MM-DD-YYYY');
    let finish_date = Utils.formattedString2Date(this.endDate, 'MM-DD-YYYY');
    if ((finish_date.getTime() >= begining_date.getTime())) {
      this.loadOrders();
    } else {
      this.filterToastError.emit('toast');
    }
  }

  loadOrders() {
    console.log("inside load orders");
    let f_startDate = null;
    let f_endDate = null;

    let beginDate = Utils.formattedString2Date(this.startDate, 'MM-DD-YYYY');
    let finishDate = Utils.formattedString2Date(this.endDate, 'MM-DD-YYYY');

    f_startDate = Utils.formatDateToSlash(this.startDate);
    f_endDate = Utils.formatDateToSlash(this.endDate);

    let f_company = Utils.setParameter(this.selectedCompany);

    this.ordersService.getOrders_superAdmin(null, f_company, null, f_startDate, f_endDate,false).then(res => {
        this.ordersList = JSON.parse(res);
        this.totalOrders = this.ordersList.length;
        console.log(this.totalOrders);

    });
  }

  goToOrderDetails(order) {
    this.router.navigate(['/management/orders', order.id]);
  }

  centerMap(icon) {
    this.mapHandler.openInfoWindowOnMarker(icon.id, true);
  }

  centerMapRoute(route) {
    if (route.route_items.length > 0) {
      this.mapHandler.openInfoWindowOnMarker(route.route_items[0].entity_key, true);
    } else {
      this.routeNoItemsToastError.emit('toast');
    }
  }

  selectRoute(route) {
    this.mapHandler.showRoute(route);
  }

  selectOrder(order) {

  }

  // Order the routeItems by sort_index asc
  orderRouteItemsBySortId(routeItems) {
    if (routeItems.length > 1) {
      for (let j = 0; j < routeItems.length - 1; j++) {
        for (let i = 0; i < routeItems.length - 1; i++) {
          let routeItem1 = routeItems[i];
          let routeItem2 = routeItems[i + 1];
          if (routeItem1.sort_index > routeItem2.sort_index) {
            routeItems[i] = routeItem2;
            routeItems[i + 1] = routeItem1;
          }
        }
      }
    }
    return routeItems;
  }

  // Find company by id loaded in memory
  getCompanyByKey(company_key) {
    if (this.companyList.length > 0) {
      for (let i = 0; i < this.companyList.length; i++) {
        if (this.companyList[i].id === company_key) {
          return this.companyList[i];
        }
      }
      return null;
    } else {
      return null;
    }
  }

  view_route(route,j) {
    route.display = true;
    console.log(route);
    this.loadRouteItemsByRoute(route.id,j);
  }

  close_view_route(route) {
    route.display = false;
  }

  //server_entity_view(item,route_number,server_route_number){
  server_entity_view(item,route_number){
    item.display=true;
    // this.mapHandler.add_waypt(route_number,this.service_routes[server_route_number]);
    console.log("before route in server_entity_view");
    console.log(route_number);
    console.log("before serverroute instance");
    this.routesService.saveRoutes(this.routesList[route_number]);
    console.log("after routesservice saveroutes")
    console.log(this.routesList[route_number]);
    console.log(this.routeItemsList[route_number]);
    console.log(this.rawRouteItems);
    console.log(this.rawRouteItems.getEntityType());
    this.mapHandler.add_waypt(route_number, this.routesList[route_number], this.rawRouteItems);
  }
  //close_server_entity_view(item,route_number,server_route_number){
  close_server_entity_view(item,route_number){
  item.display=false;
    // this.mapHandler.remove_waypt(route_number,this.service_route_numberte_number]);
    this.mapHandler.remove_waypt(route_number,this.routesList[route_number]);
  }7

  loadRouteItems(){
    console.log("inside dashboard.component.loadRouteitems()")
    this.routesService.getRouteItems().then(res => {
        console.log(res);
    });
  }

  loadRouteItemsByRoute(route_key,route_index){
    console.log("inside dashboard.component.loadRouteitemsbyroute()")
    console.log(route_key);
    this.routesService.getRouteItemsByRoute(route_key).then(res => {
        let route_item_info = []
        for(let i=0;i<res.length;i++){
          var info={};
          //this.rawRouteItems = res;
          info["display"]=false;
          info["entity_type"]=res[i].entity_type;
          if(res[i].entity_type="serviceorder"){
            info["size"] =ASSET_SIZE_LIST[res[i].item.asset_size]
            info["order_type"] =PURPOSE_OF_SERVICE_LIST[res[i].item.purpose_of_service]
          }
          route_item_info[i]=info;
        }
        this.routeItemsList[route_index]=route_item_info;
        console.log("before this.routeItemsList")
        console.log(this.routeItemsList);
        console.log(typeof this.rawRouteItems);
       
    });
  }

}
