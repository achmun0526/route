import {Component, OnInit, EventEmitter, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {MaterializeAction} from "angular2-materialize";
import {BaseComponent} from "../../../common/base-component";
import {AuthService} from '../../../services/auth/auth.service';
import {RoutesService} from '../../../services/routes/routes.service';
import {OrdersService} from '../../../services/orders/orders.service';
import {ServiceRoute} from "../../../model/route";
import {YardsService} from '../../../services/yards/yards.service';
import {FacilitiesService} from "../../../services/facilities/facilities.service";
import {isNullOrUndefined} from "util";
import {MapHandlerComponent} from "../../common/map-handler/map-handler.component";
import {KeyValueEntity} from "../../../model/key_value_entity";
import {SharedService} from "../../../services/shared/shared.service";
import {CustomLatLng} from "../../../model/custom_lat_lng";
import {RouteItem} from "../../../model/routeItem";
import {Utils} from "../../../common/utils";
import {User} from "../../../model/user";

declare var $: any;
declare var google: any;

@Component({
  selector: 'app-details-route',
  templateUrl: './details-route.component.html',
  styleUrls: ['./details-route.component.css']
})
export class DetailsRouteComponent extends BaseComponent implements OnInit {

  private editRouteModal = new EventEmitter<string | MaterializeAction>();
  private list = {
    facilityItems: true,
    yardItems: true,
    serviceorderItems: true,
  }
  private lat = 32.773419354975175;
  private lng = -96.800537109375;
  private assignedMarkers = [];
  private yardsMarkers = [];
  private unassignedOrdersMarkers = [];
  private facilitiesMarkers = [];
  // stores all markers
  private allMarkers = [];
  private selectRoute: ServiceRoute = null;
  private type = 0;
  private selectCompany;
  private purposeServiceList: KeyValueEntity[] = [];
  private assetsSizeList: KeyValueEntity[] = [];
  private selectItem;
  private refreshMapButton = false;
  // add activatedRoute item toasts
  private addRoutesItemToast = new EventEmitter<string | MaterializeAction>();
  private addRoutesItemToastError = new EventEmitter<string | MaterializeAction>();
  private deleteItemToast = new EventEmitter<string | MaterializeAction>();
  private deleteItemToastError = new EventEmitter<string | MaterializeAction>();
  private addMessageToUserModal = new EventEmitter<string | MaterializeAction>();

  private routePoints: CustomLatLng[] = [];
  private routeOldOrder = [];
  private sendSMSModal = new EventEmitter<string | MaterializeAction>();
  private selectedRouteItems_by_ctrl = [];
  private userToSend: User = null;

  private index = 0;
  private limit = 0;

  @ViewChild(MapHandlerComponent) mapHandler: MapHandlerComponent;

  constructor(activatedRoute: ActivatedRoute,
    private routesService: RoutesService,
    private ordersService: OrdersService,
    private authService: AuthService,
    private yardsService: YardsService,
    private facilitiesService: FacilitiesService,
    private sharedService: SharedService) {
    super(activatedRoute)
  }

  // ****//
  ngOnInit() {
    super.ngOnInit();
    this.ordersService.getPurposeOfServiceList().then(res => this.purposeServiceList = res);
    this.ordersService.getAssetsSizeList().then(res => {
      this.assetsSizeList = res;
    });
    this.selectCompany = this.authService.getCurrentSelectedCompany();
    this.getRoute();
  }


	/**
   * Loads the current route
   *
   * */
  getRoute() {
    // var bounds:LatLngBounds=new LatLngBounds();
    this.assignedMarkers = [];
    this.activatedRoute.params.switchMap((params: Params) => this.routesService.getRoutesId(params['id'])).
      subscribe((orderRes: ServiceRoute) => {
        this.selectRoute = orderRes;
        // reorder route items
        this.selectRoute.route_items = this.orderRouteItemsBySortId(this.selectRoute.route_items);
        this.calculateRouteWay();
      });
  }

  calculateRouteWay() {
    if (this.selectRoute.route_items.length > 0) {  // If there is no routeItems ready dont calculare routeWay
      this.sharedService.calculateWayPointsForRouteItems(this.selectRoute.route_items).then(res => {
        // console.log('WAY ',res);
        if (res != null && res.status === 'OK') {
          this.routePoints = [];
          var legs = res.routes[0].legs;
          for (let item of legs) {
            var isFirstPoint = true;
            for (let step of item.steps) {
              if (isFirstPoint) {
                this.routePoints.push(new CustomLatLng(step.start_location.lat, step.start_location.lng));
                this.routePoints.push(new CustomLatLng(step.end_location.lat, step.end_location.lng));
                isFirstPoint = false;
              } else {
                this.routePoints.push(new CustomLatLng(step.end_location.lat, step.end_location.lng));
              }
            }
          }
        }
      });
    }
  }

  /**
   * Retrieves the unassigned orders
   *
   * */
  getUnassignedOrders() {
    this.unassignedOrdersMarkers = [];
    this.ordersService.getOrders(false,null, {state: 1}).then(res => {
      var ordersList = JSON.parse(res);

      for (var e = 0; e < ordersList.length; e++) {
        var order = ordersList[e];
        var obj = {
          latitude: parseFloat(order.site.latitude),
          longitude: parseFloat(order.site.longitude),
          label: this.Utils.findNameByIdOnKeyValueList(this.assetsSizeList, order.asset_size).replace(" Yard", ""),
          draggable: false,
          name: this.Utils.findNameByIdOnKeyValueList(this.purposeServiceList, order.purpose_of_service),
          icon: 'assignment',
          id: order.id,
          type: RouteItem.ENTITY_TYPES.ORDER,
          iconUrl: this.ASSETS + '/markers/' + Utils.getIconForOrder(order) + '?id=' + order.id,
          openInfoWindow: true,
          element: order
        };
        this.unassignedOrdersMarkers.push(obj);
        // all to all for allowing easy calculations
        this.allMarkers.push(obj);
       // this.mapHandler.addToMapBounds(obj.latitude, obj.longitude);
      }
      this.getYards();
    });
  };


	/***
   * Obtain the list of Yards
   * */
  getYards() {
    this.yardsMarkers = [];
    this.yardsService.getYards(null).then(res => {
      var yardsList = res.records;
      for (var i = 0; i < yardsList.length; i++) {
        var yard = yardsList[i];
        var obj = {
          latitude: parseFloat(yard.latitude),
          longitude: parseFloat(yard.longitude),
          // label: '',
          label: '',
          name: yard.yard_name,
          icon: 'location_on',
          id: yard.id,
          type: RouteItem.ENTITY_TYPES.YARD,
          iconUrl: this.ASSETS + '/markers/' + RouteItem.ENTITY_TYPES.YARD + '-yellow.png' + '?id=' + yard.id,
          openInfoWindow: true,
          element: yard,
        };
        this.yardsMarkers.push(obj);
        // add to all markers for allowing easy calculations
        this.allMarkers.push(obj);
        //this.mapHandler.addToMapBounds(obj.latitude, obj.longitude);
      }
      this.getDisposals();
    });
  }

  /**get disposals (facilities)**/
  getDisposals() {
    this.facilitiesMarkers = [];
    this.facilitiesService.getFacilities(null).then(res => {
      var facilitiesList = res.records;
      for (var i = 0; i < facilitiesList.length; i++) {
        var facility = facilitiesList[i];

        var obj = {
          latitude: parseFloat(facility.latitude),
          longitude: parseFloat(facility.longitude),
          label: '',
          name: facility.facility_name,
          icon: 'delete_sweep',
          id: facility.id,
          type: RouteItem.ENTITY_TYPES.FACILITY,
          iconUrl: this.ASSETS + '/markers/' + RouteItem.ENTITY_TYPES.FACILITY + '-blue.png' + '?id=' + facility.id,
          openInfoWindow: true,
          element: facility,
        };
        this.facilitiesMarkers.push(obj);
        // To all markers for allow easy calculations
        this.allMarkers.push(obj);
       // this.mapHandler.addToMapBounds(obj.latitude, obj.longitude);
      }
      //this.mapHandler.fitBounds();
    });
  }

	/**
	 * Adds routeitem to list to be saved or shows popup
	 * @param routeItem
	 * @param centerInMap
	 * @param
	 */
  unassignedRouteItem_click(routeItem, centerInMap, $event) {
    $event.stopPropagation(); // prevents container element click clear event be fired
    if ($event.ctrlKey) {
      // check if the item already exists
      var routeItem_alreadyExists = false;
      for (var i = 0; i < this.selectedRouteItems_by_ctrl.length; i++) {
        if (this.selectedRouteItems_by_ctrl[i].element.id == routeItem.element.id) {
          routeItem_alreadyExists = true;
          break;
        }
      }
      if (!routeItem_alreadyExists) {
        $("#" + routeItem.element.id).addClass("ctrlSelected");
        this.selectedRouteItems_by_ctrl.push(routeItem);
      }
    } else { // show the routeItem popUp
      //this.mapHandler.openInfoWindowOnMarker(routeItem.element.id, centerInMap);
    }
  }


	/**
	 * Clear all selected elements when click outside routeItems
	 */
  clearSelections() {
    $(".ctrlSelected").removeClass("ctrlSelected");
    this.selectedRouteItems_by_ctrl = [];
  }

	/***
   *
   * save activatedRoute item
   *
   * **/
  addRouteItem(data) {
    var lat = data.latitude.toString();
    var long = data.longitude.toString()
    var newItem = {
      route_key: this.selectRoute.id,
      entity_key: data.element.id,
      sort_index: 0,
      entity_type: data.type,
      active: true,
      latitude: lat,
      longitude: long,
    };
    this.routesService.addRouteItem(newItem).then(res => {
      if (res != null) {
        this.addRoutesItemToast.emit('toast');
        this.ngOnInit();
      } else {
        this.addRoutesItemToastError.emit('toast');
      }
    });
  }

  buildRouteItem(data) {
    var newItem = {
      route_key: this.selectRoute.id,
      entity_key: data.element.id,
      sort_index: 0,
      entity_type: data.type,
      active: true,
      latitude: data.latitude.toString(),
      longitude: data.longitude.toString()
    };
    return newItem;
  }
	/**
	 * Adds multiple items seleted by CTRL + click
	 * @param data // this data is only one route item
	 */
  refreshUI() {
    this.selectedRouteItems_by_ctrl = [];
    this.ngOnInit();
  }
  addRouteItemMultiselect(data) {
    // save only 1 (clicked on plus button without others selected)
    if (this.selectedRouteItems_by_ctrl.length == 0) {
      var newItem = this.buildRouteItem(data);
      this.routesService.addRouteItem(newItem).then(res => {
        if (res != null) {
          this.addRoutesItemToast.emit('toast');
          this.refreshUI();
        } else {
          this.addRoutesItemToastError.emit('toast');
        }
      });
    }
    // save all routeItem selected
    else {
      // save all route items starts by 0 index
      this.limit = this.selectedRouteItems_by_ctrl.length - 1;
      this.index = 0;
      this.addRouteItemRecursive(this.index, this.selectedRouteItems_by_ctrl);
    }
  }

  addRouteItemRecursive(index, routeItemList) {
    this.index = index;
    var routeItem = routeItemList[index];
    var parsedItem = this.buildRouteItem(routeItem);
    this.routesService.addRouteItemRecursive(parsedItem).then(res => {
      if (this.index < this.limit) {
        // if there is more items to save
        this.addRouteItemRecursive(this.index + 1, routeItemList);
      } else {
        // show sucessfull messsage
        this.closeModals();
        this.addRoutesItemToast.emit('toast');
        this.refreshUI();
      }
    });
  }


	/**
   * delete the item in the activatedRoute*
   *
   * */
  deleteRouteItem(data) {
    var object = {id: data.id, active: false};
    this.routesService.addRouteItem(object).then(res => {
      if (res != null) {
        this.closeModals();
        this.deleteItemToast.emit('toast');
        this.ngOnInit();
      } else {
        this.deleteItemToastError.emit('toast');
      }
    });
  }

	/**
	 * Arrange routeItem order
	 */
  arrangeRouteItem(routeItems, current_routeItem, direction) {

    var index;
    for (index = 0; index < routeItems.length; index++) {
      if (routeItems[index].id == current_routeItem.id) {
        break;
      }
    }

    var firstIndex = 0;
    var lastIndex = routeItems.length - 1;
    var exchange_routeItem;
    if (direction == "up" && index > firstIndex) {
      exchange_routeItem = routeItems[index - 1];
    }
    if (direction == "down" && index < lastIndex) {
      exchange_routeItem = routeItems[index + 1];
    }
    // if hs to be chage sort order
    if (exchange_routeItem != undefined) {
      // exchange sort_index
      var temp_sort_index = current_routeItem.sort_index;
      current_routeItem.sort_index = exchange_routeItem.sort_index;
      exchange_routeItem.sort_index = temp_sort_index;

      // enable both entities for save method
      current_routeItem.active = true;
      exchange_routeItem.active = true;

      // add method works too for edit routeItem
      this.routesService.addRouteItem(current_routeItem).then(res => {
        if (res != null) {
          // this.addRoutesItemToast.emit('toast');
          // this.ngOnInit();
          this.routesService.addRouteItem(exchange_routeItem).then(res2 => {
            if (res != null) {
              this.ngOnInit();
            }
            else {
              this.addRoutesItemToastError.emit('toast');
            }
          });
        } else {
          this.addRoutesItemToastError.emit('toast');
        }
      });
    }
  }

  // Order the routeItems by sort_index asc
  orderRouteItemsBySortId(routeItems) {
    if (routeItems.length > 1) {
      for (var j = 0; j < routeItems.length - 1; j++) {
        for (var i = 0; i < routeItems.length - 1; i++) {
          var routeItem1 = routeItems[i];
          var routeItem2 = routeItems[i + 1];
          if (routeItem1.sort_index > routeItem2.sort_index) {
            routeItems[i] = routeItem2;
            routeItems[i + 1] = routeItem1;
          }
        }
      }
    }
    return routeItems;
  }


  /**
   *
   *
   * */
  onRouteUpdated() {
    this.editRouteModal.emit({action: 'modal', params: ['close']});
    this.ngOnInit();
  }

	/*****
	 * this method is called when ngif that loads all li items are ready
	 * through variable last.
	*/
  makeSortable() {
    $("#routeItemList").sortable({
      handle: ".list-handler",
      update: function() {
        $("#fakeSaveRearrange").click();
      }
    });
  }

	/***
	 * this method saves all routeitems ordered
	 * when finish it shows success message
	 */
  saveRouteItemsOrdered() {
    // save old order routeItems for comparison
    this.saveRouteOldOrder();
    var li = $("#routeItemList li.collection-item2");
    // update sort_index for all elements
    for (var i = 0; i < li.length; i++) {
      var li_id = li[i].id;
      for (var j = 0; j < this.selectRoute.route_items.length; j++) {
        var routeItem_id = this.selectRoute.route_items[j].id;
        if (li_id == routeItem_id) {
          this.selectRoute.route_items[j].sort_index = i;
        }
      }
    }
    // save all routeItems
    var max = this.selectRoute.route_items.length;
    var cnt = 0;
    for (var k = 0; k < max; k++) {
      var ri = this.selectRoute.route_items[k];
      ri.active = true;
      this.routesService.addRouteItemBackground(ri).then(res => {
        if (res != null) {
          if (++cnt === max) {
            // this.getRoute();
            this.addRoutesItemToast.emit('toast');
            if (this.routeHasChanged()) {
              this.refreshMapButton = true;
            }
          }
        }
        else {
          this.addRoutesItemToastError.emit('toast');
        }
      });
    }
  }


	/**
	 * Method that saves the routeItems order previous reorder, add or delete routeItems to route
	 */
  saveRouteOldOrder() {
    for (var i = 0; i < this.selectRoute.route_items.length; i++) {
      this.routeOldOrder.push(
        {
          routeItem_id: this.selectRoute.route_items[i].id,
          sort_index: this.selectRoute.route_items[i].sort_index
        }
      );
    }
  }


  routeHasChanged() {
    var newRouteOrder = [];
    for (var i = 0; i < this.selectRoute.route_items.length; i++) {
      newRouteOrder.push(
        {
          routeItem_id: this.selectRoute.route_items[i].id,
          sort_index: this.selectRoute.route_items[i].sort_index
        }
      );
    }
    if (this.routeOldOrder.length != newRouteOrder.length) { // if added or deleted route items
      var ri = newRouteOrder.length - this.routeOldOrder.length;
      if (ri > 0) {
        console.log(ri + " route items added");
      } else {
        console.log(ri + "route items deleted");
      }
      return true;
    }
    // compare if order has changed
    var numberOfchanges = 0;
    for (var j = 0; j < this.routeOldOrder.length; j++) {
      for (var k = 0; k < newRouteOrder.length; k++) {
        if (this.routeOldOrder[j].id == newRouteOrder[k].id) {
          if (this.routeOldOrder[j].sort_index != newRouteOrder[k].sort_index) {
            numberOfchanges++;
          }
        }
      }
    }

    // console.log("numberOfChanges", numberOfchanges);
    if (numberOfchanges > 0) {
      return true;
    } else {
      return false;
    }
  }

  refreshMap() {
    this.refreshMapButton = false;
    this.getRoute();
  }

	/**
	 * Method that send to driver one notification when route order has changed.
	 */
  notifyDriver() {
    console.log("Driver: ", "route has changed, update your route view");
  }
  openSMSModal(route) {
    // this.selectedUser=driver;
    // Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    this.selectRoute = route;
    setTimeout(() => {
      this.sendSMSModal.emit({action: 'modal', params: ['open']});
    }, 500);
  }
  onSMSCancelled() {
    this.sendSMSModal.emit({action: 'modal', params: ['close']});
  }
  onSMSsent() {
    this.sendSMSModal.emit({action: 'modal', params: ['close']});
  }

  openEditRouteModal() {
    setTimeout(() => {
      this.editRouteModal.emit({action: 'modal', params: ['open']})
    }, 500);
  }

  openNewMessageToUserModal(userToSend) {
    this.userToSend = userToSend;
    setTimeout(() => {
      this.addMessageToUserModal.emit({action: 'modal', params: ['open']});
    }, 100);
  }

  onMessageToUserCreated() {
    this.addMessageToUserModal.emit({action: 'modal', params: ['close']});
    this.userToSend = null;
  }

  onAddMessageToUserCancelled() {
    this.userToSend = null;
    this.addMessageToUserModal.emit({action: 'modal', params: ['close']});
  }

  closeModals() {
    this.deleteItemToast.emit({action: 'modal', params: ['close']});
  }
}
