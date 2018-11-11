/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 *
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/*
 * File:   map-handler.component.ts
 * Author: forest schwartz
 *
 * Created on December 12, 2017, 7:09 PM
 */
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
  destination_number_index=[];

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



showRoute(route_items) {

  console.log("///////////////SHOW ROUTE/////////////////////");
   this.markers=[];
   for (let i = 0; i < this.destination_number_index.length; i++) {
       let index = this.destination_number_index[i];
       let markerobj = route_items[index].getMarkerObjectForEntity();
       this.markers.push(markerobj);
   }
   console.log("after markers");
   this.direction={
       origin: this.waypts[0].location,
       destination: this.waypts[this.waypts.length-1].location,
       waypoints: this.waypts,
       optimizeWaypoints: false,
       travelMode: 'DRIVING'
   };
   console.log("after direction");
   this.directionsRendererDirective['initialized$'].subscribe( directionsRenderer => {
    this.directionsRenderer = directionsRenderer;
   });
   console.log("after directionrender");
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



  add_waypt(destination_number, route_items){
    console.log("///////////////ADDING WAYPT/////////////////");
    let destination_number_int = parseInt(destination_number);
    this.destination_number_index.push(destination_number_int);
    console.log("logging the unsorted route number index");
    console.log(this.destination_number_index);
    this.destination_number_index.sort(function(a, b){return a-b});
    console.log("logging the sorted route number index");
    console.log(this.destination_number_index);

    var number_of_destinations = this.destination_number_index.length;
    console.log(number_of_destinations);
      this.waypts=[];
    for(let i=0;i<number_of_destinations;i++){
      console.log("before waypts push");
      let index = this.destination_number_index[i]
      console.log(index);
      let route_item = route_items[index]
      let latitude = 0;
      let longitude = 0;
      if(route_item.entity_type=="serviceorder"){
        latitude = route_item['entity']['site'].latitude;
        longitude = route_item['entity']['site'].longitude;
      }else{
        latitude = route_item['entity'].latitude;
        longitude = route_item['entity'].longitude;
      }
      this.waypts.push({
          location: latitude + "," + longitude,
          stopover: true
      });
    console.log("after for loop for waypts push");
    }

    console.log("logging the waypts");
    console.log(this.waypts);
    this.showRoute(route_items);
  }

  remove_waypt(destination_number,route_items){
    console.log("///////////////REMOVING WAYPT/////////////////");
    console.log("logging the sorted route number index before removal");
    console.log(this.destination_number_index);
    var index_of_removal = this.destination_number_index.indexOf(destination_number);
    if (index_of_removal > -1) {
      this.destination_number_index.splice(index_of_removal, 1);
    }
    debugger
    console.log("logging the sorted route number index after removal");
    console.log(this.destination_number_index);
    var number_of_locations = this.destination_number_index.length;
      this.waypts=[];
    for(var i=0;i<number_of_locations;i++){
      let index = this.destination_number_index[i];
      let route_item = route_items[index]
      let latitude = 0;
      let longitude = 0;
      if(route_item.entity_type=="serviceorder"){
        latitude = route_item['entity']['site'].latitude;
        longitude = route_item['entity']['site'].longitude;
      }else{
        latitude = route_item['entity'].latitude;
        longitude = route_item['entity'].longitude;
      }
      this.waypts.push({
          location: latitude + "," + longitude,
          stopover: true
      });
    }
    console.log("logging the waypts");
    console.log(this.waypts);
    this.showRoute(route_items);
  }

}
