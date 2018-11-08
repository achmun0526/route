import { Component, OnInit, Output, EventEmitter, ViewChild, Input, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';
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
export class SaveIncidentComponent implements OnInit, OnChanges {

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
    // this.setup_order();
    // this.joinDateToTime();
  }

  ngOnChanges(changes: SimpleChanges) {
    const currentOrderToEdit: SimpleChange = changes.orderToEdit;
    if(currentOrderToEdit.currentValue){
      this.setup_order();
    }
  }

  saveIncident(){
    console.log("logging the input order");
    console.log(this.orderToEdit);

    console.log("inside incident report");
    this.incident.order_id = this.orderToEdit.id;
    this.incident.service_ticket_id = this.orderToEdit.service_ticket_id;
    console.log("logging the incident before service")
    console.log(this.incident);


    // Saving the order with the updated state if the order was canceled
    if(this.incident.order_canceled==true){
      this.ordersService.deleteOrder(this.incident.order_id).then(res =>{
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

    this.incident = {};
    
  }

    update_order_status(){
      console.log("updating the order state");
      this.incident.order_canceled=$('#incident_canceled_status').is(":checked");

    }

    setup_order(){
      this.order = this.orderToEdit;
    }

    clearIncident() {
      this.incident = {};
    }

  }
