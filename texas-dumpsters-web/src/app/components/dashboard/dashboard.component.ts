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
import {DriversService} from '../../services/drivers/drivers.service';

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
  private serviceDetailModal = new EventEmitter<string|MaterializeAction>();

  private pageInfo = {page: 1, page_size: PAGE_SIZE};
  private errorModal = new EventEmitter<string|MaterializeAction>();
  protected companyList = [];
  protected driverList = [];
  private driver_list2=[];
  private driver_names=[];
  protected vehicleList = [];


  protected selectedCompany: any;
  private selectedCompany_before = [];

  protected selectedVehicle: any;
  private selectedVehicle_before = [];

  protected selectedDriver: any;
  protected selectedDriver_before = [];

  public startDate: any;
  public endDate: any;

  protected routesList = [];
  protected totalRoutes = 0;

  driver: string;
  vehicle: string;

  selectedValue: string;
  totalOrders: number;

  private num_of_drivers=0;
  private route_object_list_arr = [];
  private service_routes = [];
  private route_items_holder=[];
  private markers_initialized = false;
  private current_route_list_number:number;
  service_detail_number:number;
  service_detail_info:any;
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
    private companiesService: CompaniesService, private driversService:DriversService) {
    super(route);
  }

  ngOnInit() {
    super.ngOnInit();
    this.startDate = Utils.date2FormattedString(new Date(), 'MM-DD-YYYY');
    this.endDate = Utils.date2FormattedString(new Date(), 'MM-DD-YYYY');
    // At the begining filters are set to all possible values after that it filters
    this.getAllCompanies();
    this.getAllDrivers();
    this.getAllVehicles();
    this.getAllDrivers2(); // fix this later
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

  getAllDrivers2() {
    console.log("Inside get all drivers2")
    this.driversService.getDrivers(true,null).then(res => {
      this.driver_list2=JSON.parse(res);
      Styles.fixDropDownHeigh('smallDropdown', 5);
    });
  }

  driverChange(route){
    console.log("updating the driver info")
    this.routesService.saveRoute(route);
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
    console.log("=================================================");
    console.log("in filterRoutes");
    let begining_date = Utils.formattedString2Date(this.startDate, 'MM-DD-YYYY');
    let finish_date = Utils.formattedString2Date(this.endDate, 'MM-DD-YYYY');
    if ((finish_date.getTime() >= begining_date.getTime())) {
      this.loadRoutes();
    } else {
      this.filterToastError.emit('toast');
    }
  }

  loadRoutes() {
    console.log("=================================================");
    console.log("in loadRoutes")
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
      var service_route = new ServiceRoute();
        this.totalRoutes = this.routesList.length;
        for(let i=0;i<this.totalRoutes;i++){
          this.routesList[i]["display"]=false;
          service_route.extract_response_data(res[i]);
          this.service_routes[i] = service_route;
        }
    });
  }

  view_route(route,route_index) {
    //close every route.
    for (let eachRoute of this.routesList) eachRoute.display = false;
    //make the selected route visible.
    route.display = true;
    let route_object_list = [];
    this.current_route_list_number = route_index;
    //retrieve route items for the route.
    this.routesService.getRouteItemsByRoute(route.id).then(res => {
      this.route_items_holder[route_index] = res;
      let route_object = {};
      for(let i=0;i<res.length;i++){
        let route_item = new RouteItem();
        route_item.populate(res[i].entity_type, res[i].entity_key, res[i].sort_index, res[i].entity, res[i].dist_2_next, res[i].time_2_next, route_index);
        this.service_routes[route_index].populate_route_items(route_item);
        route_object['display']=false;
        route_object['type']=res[i].entity_type;
        if(res[i].entity_type=='serviceorder'){
          route_object['size']=Utils.getNameFromVal(ASSET_SIZE_LIST, res[i].entity.asset_size);
          route_object['order_type']=Utils.getNameFromVal(PURPOSE_OF_SERVICE_LIST,res[i].entity.purpose_of_service);
        }
        route_object_list[i]=route_object;
        route_object = {};
      }
      this.route_object_list_arr[route_index]=route_object_list;
    });
  }

  close_view_route(route) {
    route.display = false;
  }

  server_entity_view(item, destination_number, route_number){
    item.display=true;
    let route_items = this.service_routes[route_number]['route_items'];
    this.mapHandler.add_waypt(destination_number, route_items);
  }

  close_server_entity_view(item, destination_number, route_number){
    item.display=false;
    let route_items = this.service_routes[route_number]['route_items'];
    this.mapHandler.remove_waypt(destination_number,route_items);
  }

  show_event_data(event_data){
    this.service_detail_number = event_data;
    this.service_detail_info = this.route_items_holder[this.current_route_list_number][this.service_detail_number];
    this.markers_initialized = true;
    setTimeout(() => {
      this.serviceDetailModal.emit({action:'modal',params:['open']});
      }, 100);
  }

  openErrorModal(){
    setTimeout(() => {
      this.errorModal.emit({action:'modal',params:['open']})
    }, 100);
  }

  onCloseClicked(){
    this.errorModal.emit({action:'modal',params:['close']});
  }
}
