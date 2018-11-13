import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { Router, ActivatedRoute, Route } from '@angular/router';
import { BaseComponent } from "../../common/base-component";
import { Utils } from "../../common/utils";
import { Styles } from "../../common/styles";
import { IncidentsService } from '../../services/incidents/incidents.service';
import { AuthService } from '../../services/auth/auth.service';
import { PAGE_SIZE, ROLE_NAMES, ASSETS_URL } from '../../common/app-conf';
import {KeyValueEntity} from "../../model/key_value_entity";

@Component({
  selector: 'incidents-report',
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.css']
})
export class IncidentReportComponent extends BaseComponent implements OnInit {

    private incidentsTypeList:KeyValueEntity[]=[];
    private incidentsStatusList:KeyValueEntity[]=[];
    private incidentsList = [];
    private incidentsDisplayList=[]
    private driverList = [];
    private date;
    private date_changed_bool = false;
    private startDate: any;
    private endDate: any;
    private pageInfo = {page:1,page_size:PAGE_SIZE};
    private driverSelected: any;
    public filterToastError = new EventEmitter<string|MaterializeAction>();
    private total_incidents = 0;
    private entityKeyToViewFiles: string=null;
  private attachmentsModal = new EventEmitter<string|MaterializeAction>();

    constructor( route:ActivatedRoute, private incidentsService: IncidentsService, private authService:AuthService) {
        super(route);
        // this.startDate = new Date();
        // this.startDate = (this.startDate.getMonth()+1)+'-'+(this.startDate.getDate())+'-'+this.startDate.getFullYear();
        // this.endDate = new Date();
        // this.endDate = (this.endDate.getMonth()+1)+'-'+(this.endDate.getDate())+'-'+this.endDate.getFullYear();
        // this.date = {};
        // this.date.date = Utils.date2FormattedString(Utils.addDays(new Date, 0), 'MM/DD/YYYY');

    }

    ngOnInit() {
        super.ngOnInit();
        this.authService.getUsersByRole(ROLE_NAMES.DRIVER, false).then(res=>{
            this.driverList = res.records;
            Styles.fixDropDownHeigh("smallDropdown", 5);
		    });
        // this.incidentsService.getIncidentsTypeList().then(res=>{
        //   this.incidentsTypeList=res;
        // });
        // this.incidentsService.getIncidentsStatusList().then(res=>{
        //   this.incidentsStatusList=res;
        // });
        this.startDate = Utils.date2FormattedString(Utils.addDays(new Date, 0), 'MM/DD/YYYY');
        this.endDate = Utils.date2FormattedString(Utils.addDays(new Date, 0), 'MM/DD/YYYY');
        this.filter(false);
    }

    // filter(){
    //     if(this.checkDatesRange()){
    //         this.incidentsService.getIncidents(this.pageInfo, this.driverSelected == 'none'? null: this.driverSelected, this.parseDate(this.startDate), this.parseDate(this.endDate)).then(res =>{
    //
    //             this.totalIncidents = res.total_records;
    //             this.incidentsList = res.records;
    //             console.log("logging the incidents");
    //             console.log(this.incidentsList);
    //
    //         },err =>{
    //
    //         });
    //     }
    // }


    filter(overwrite){
      console.log("logging the start date");
      console.log(this.startDate);
      console.log("logging the end date");
      console.log(this.endDate);

          this.incidentsService.getIncidents(overwrite,null, null, this.startDate, this.endDate).then(res =>{
              this.incidentsList = JSON.parse(res);
              this.total_incidents = this.incidentsList.length;
              this.incidentsDisplayList=this.incidentsList.slice(0,10);
              // this.total_incidents = this.incidentsList.length;
              console.log("logging the incidents");
              console.log(this.incidentsList);
              console.log(this.total_incidents);
              for(let i=0;i<this.incidentsList.length;i++){
                this.incidentsList[i].created_at=this.incidentsList[i].created_at.slice(0,10);
              }

          })
          .catch(err => console.log('error: %s', err));

    }
    // checkDatesRange(){
    //     let dia = this.startDate.split('-')[1];
    //     let mes = this.startDate.split('-')[0];
    //     let anio = this.startDate.split('-')[2];
    //     let fechaStart = new Date(anio,mes,dia);
    //     dia = this.endDate.split('-')[1];
    //     mes = this.endDate.split('-')[0];
    //     anio = this.endDate.split('-')[2];
    //     let fechaEnd = new Date(anio,mes,dia);
    //     if((fechaEnd.getTime() >= fechaStart.getTime())){
    //         return true;
    //     }else{
    //         this.filterToastError.emit('toast');
    //         return false;
    //     }
    // }

    // Changes page at bottom of the orders list
      changePage(page) {
          this.pageInfo.page = page+1;
          var start_pos = (this.pageInfo.page-1)*10;
          var end_pos = start_pos+10;
          if(end_pos>this.total_incidents){
            this.incidentsDisplayList=this.incidentsList.slice(start_pos,this.total_incidents);
          }else{
            this.incidentsDisplayList=this.incidentsList.slice(start_pos,end_pos);
          }
    	  }

    // parseDate(date){
    //     let dia = date.split('-')[1];
    //     let mes = date.split('-')[0];
    //     let anio = date.split('-')[2];
    //     let fecha = new Date(anio,mes,dia);
    //     return (fecha.getMonth())+'/'+(fecha.getDate())+'/'+fecha.getFullYear();
    // }

  /**
   *
   *
   * **/
  viewAttachments(entity_key:string){
    this.entityKeyToViewFiles=null;
    setTimeout(()=>{
      this.entityKeyToViewFiles=entity_key;
      setTimeout(() => {
        this.attachmentsModal.emit({action:'modal',params:['open']});
      }, 100);
    },100);
  }

  /**
   *
   * */
  openEditIncidentModal(selectedIncident){
    console.log("incide edit incident");
    // this.selectedOrder=order;
    // //Before displaying the modal we need to add a delay in order to allow the ui to be drawn
    // setTimeout(() => {
    //   this.editOrderModal.emit({action:'modal',params:['open']});
    // }, 350);

  }


  /** edit customer function **/
  deleteIncident(selectedIncident){
    console.log("inside delete incident");
    this.incidentsService.deleteIncident(selectedIncident.id).then(res =>{
      if(res != null){
        console.log(res);
        this.pageInfo.page=1;
        this.filter(true);
      }
    });
  }

}
