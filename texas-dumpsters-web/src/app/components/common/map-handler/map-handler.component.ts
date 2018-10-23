import {AfterViewInit, Component, Input, Output, EventEmitter, OnInit, ViewChild, ViewChildren, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import { NguiMapComponent, DirectionsRenderer, Marker} from '@ngui/map';
import {isNullOrUndefined} from 'util';

// Core
import {MaterializeDirective, MaterializeAction} from 'angular2-materialize';
import {PAGE_SIZE, ROLE_NAMES, ASSETS_URL} from '../../../common/app-conf';
import {Router, ActivatedRoute, Route} from '@angular/router';
import {Utils} from '../../../common/utils';
import {Styles} from '../../../common/styles';

// Components
import {BaseComponent} from '../../../common/base-component';

// Models
import {ServiceRoute} from '../../../model/route';
import {KeyValueEntity} from '../../../model/key_value_entity';
import {CustomLatLng} from '../../../model/custom_lat_lng';
import {RouteItem} from '../../../model/routeItem';
import {Order} from '../../../model/order';

@Component({
  selector: 'app-map-handler',
  templateUrl: './map-handler.component.html',
  styleUrls: ['./map-handler.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class MapHandlerComponent implements OnInit, AfterViewInit {
  @ViewChild(NguiMapComponent) mapComponent: NguiMapComponent;
  @ViewChild(DirectionsRenderer) directionsRendererDirective: DirectionsRenderer;
  @Output() marker_clicked = new EventEmitter<number>();

  directionsRenderer: google.maps.DirectionsRenderer;
  directionsResult: google.maps.DirectionsResult;
  @Input() public direction: any ={};
  @Input() public service_route:ServiceRoute;
  markers: any;
  realMarkers: any;
  iw_content: string;
  waypts = [];
  waypts_index={};
  route_number_index=[];

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {}

  ngOnInit() {
    this.directionsRendererDirective['initialized$'].subscribe( directionsRenderer => {
   this.directionsRenderer = directionsRenderer;
   });
   this.iw_content = 'Error';
 }

 directionsChanged() {
     this.directionsResult = this.directionsRenderer.getDirections();
     this.cdr.detectChanges();
 }

 showDirection() {
     this.directionsRendererDirective['showDirections'](this.direction);
 }



showRoute(route) {

  console.log("///////////////SHOW ROUTE/////////////////////");
   this.markers=[];
   for (let i = 0; i < this.route_number_index.length; i++) {
       let index = this.route_number_index[i];
       let markerobj = route.route_items[index].getMarkerObjectForEntity();
       this.markers.push(markerobj);
   }

   this.direction={
       origin: this.waypts[0].location,
       destination: this.waypts[this.waypts.length-1].location,
       waypoints: this.waypts,
       optimizeWaypoints: false,
       travelMode: 'DRIVING'
   };

   this.directionsRendererDirective['initialized$'].subscribe( directionsRenderer => {
  this.directionsRenderer = directionsRenderer;
  });
  this.realMarkers = [];
}

  show_route_via_direction(direction){

    this.directionsRendererDirective['showDirections'](direction);

  }

  openInfoWindowOnMarker(event, marker) {
      console.log('clicked on marker' + marker.location);
      this.iw_content = 'This is Marker ' + marker.location;
      this.marker_clicked.next(marker.location);
  }



  add_waypt(route_number,route){
    console.log("///////////////ADDING WAYPT/////////////////");
    let route_number_int = parseInt(route_number);
    this.route_number_index.push(route_number_int);
    console.log("logging the unsorted route number index");
    console.log(this.route_number_index);
    this.route_number_index.sort(function(a, b){return a-b});
    console.log("logging the sorted route number index");
    console.log(this.route_number_index);
    var number_of_locations = this.route_number_index.length;
      this.waypts=[];
    for(var i=0;i<number_of_locations;i++){
      let index = this.route_number_index[i];
      this.waypts.push({
          location: route.route_items[index].getLatLng(),
          stopover: true
      });
    }

    console.log("logging the waypts");
    console.log(this.waypts);
    this.showRoute(route);
  }

  remove_waypt(route_number,route){
    console.log("///////////////REMOVING WAYPT/////////////////");
    console.log("logging the sorted route number index before removal");
    console.log(this.route_number_index);
    let route_number_int = parseInt(route_number);
    var index_of_removal = this.route_number_index.indexOf(route_number_int);
    if (index_of_removal > -1) {
      this.route_number_index.splice(index_of_removal, 1);
    }
    console.log("logging the sorted route number index after removal");
    console.log(this.route_number_index);
    var number_of_locations = this.route_number_index.length;
      this.waypts=[];
    for(var i=0;i<number_of_locations;i++){
      let index = this.route_number_index[i];
      this.waypts.push({
          location: route.route_items[index].getLatLng(),
          stopover: true
      });
    }
    console.log("logging the waypts");
    console.log(this.waypts);

    this.showRoute(route);
  }

}
