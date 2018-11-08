import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";


import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs/Observable';
import {startWith} from 'rxjs/operators/startWith';
import { isNullOrUndefined } from "util";
import { CompaniesService } from '../../../services/companies/companies.service';
import { Utils } from "../../../common/utils";
import { Styles } from "../../../common/styles";
import { KeyValueEntity } from "../../../model/key_value_entity";
//Variables
import {STATE_LIST} from "../../../common/app-conf"
//Components
import {Incident} from '../../../model/incident'
//services
import{IncidentsService} from '../../../services/incidents/incidents.service'
import{OrdersService} from '../../../services/orders/orders.service'

@Component({
  selector: 'app-save-incident',
  templateUrl: './save-incident.component.html',
  styleUrls: ['./save-incident.component.css']
})
export class SaveIncidentComponent implements OnInit {

    @Output() afterIncident = new EventEmitter();
    @Output() onCancelAction = new EventEmitter();
    @Input() orderToEdit=null;

  	private title = "Add Incident Report";
    private incident;
    private original_order_state;
    private date;
    private order;
    // private incident_canceled_status;


  constructor(private incidentsService:IncidentsService, private ordersService:OrdersService) { }

  ngOnInit() {
    this.order = {};
    this.date = {};
    this.incident={};
    this.incident.order_canceled=false;
    this.original_order_state = this.orderToEdit.state;
    this.setup_order();
    this.joinDateToTime();
  }

  saveIncident(){
    console.log("logging the input order");
    console.log(this.orderToEdit);

    console.log("inside incident report");
    this.incident.order_id = this.orderToEdit.id;
    this.incident.service_ticket_id = this.orderToEdit.service_ticket_id;
    this.incident.report_datetime = this.date.fullDate;
    console.log("logging the incident before service")
    console.log(this.incident);


// Saving the order with the updated state if the order was canceled
    if(this.incident.order_canceled==true){
      this.order.state=4;
      this.order.service_date = this.date.fullDate;
      this.ordersService.saveOrder(this.order).then(res =>{
        if(res != null){
          console.log(res);
        }
      });
    }


// Saving the incident report
      this.incidentsService.saveIncident(this.incident).then(res =>{
        if(res != null){
          console.log(res);
        }
        this.onCancelAction.emit();
      });



    }

    update_order_status(){
      console.log("updating the order state");
      this.incident.order_canceled=$('#incident_canceled_status').is(":checked");

    }


    setup_order(){
      this.order = this.orderToEdit;
      var dateArray = this.orderToEdit.service_date.split(" ");
      var date = dateArray[0];
      date = date.split("-");
      var y = date[0];
      var m = date[1];
      var d = date[2];
      this.date.date = "" + m + "/" + d + "/" + y;

      var time = dateArray[1];
      time = time.split(':');
      this.date.hour = parseInt(time[0]);
      this.date.minutes = parseInt(time[1]);

      if(this.date.hour == 0){ //12 AM
        this.date.hour = 12;
        this.date.hour_type = 1;
      }else if(this.date.hour > 0 && this.date.hour < 12){
        this.date.hour_type = 1;
      }else if(this.date.hour == 12){ //12 PM
        this.date.hour_type = 2;
      }else if(this.date.hour > 12 && this.date.hour < 24){
        this.date.hour = this.date.hour - 12;
        this.date.hour_type = 2;
      }
    }

    joinDateToTime(){

      var h = parseInt(this.date.hour);
      var m = parseInt(this.date.minutes);
      var s = "00";

      if(this.order.service_time_frame=='Pm' && h<12){
        h = h + 12;
      }
      if(this.order.service_time_frame=='Am' && h == 12){
        h = 0;
      }

      this.date.fullDate =
        this.date.date +
        " " +
        ( (h < 10)? "0" + h : "" + h ) +
        ":" +
        ( (m < 10)? "0" + m : "" + m ) +
        ':' +
        s;
    }

  }
