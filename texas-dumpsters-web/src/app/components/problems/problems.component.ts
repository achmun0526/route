import {Component, EventEmitter, OnInit} from '@angular/core';
import {BaseComponent} from "../../common/base-component";
import {ActivatedRoute} from "@angular/router";
import {ProblemsService} from "../../services/problems/problems.service";
import {Problem} from "../../model/problem";
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import {KeyValueEntity} from "../../model/key_value_entity";
import { PAGE_SIZE } from '../../common/app-conf';
import {User} from "../../model/user";
import {AuthService} from "../../services/auth/auth.service";
import {Styles} from "../../common/styles";

@Component({
  selector: 'app-problems',
  templateUrl: './problems.component.html',
  styleUrls: ['./problems.component.css']
})
export class ProblemsComponent extends BaseComponent implements OnInit {

  private problemsList:Problem[]=[];
  private problemsStatusList:KeyValueEntity[]=[];
  private totalProblems=0;
  private startDate: any;
  private endDate: any;
  private pageInfo = {page:1,page_size:PAGE_SIZE};
  private filterToastError = new EventEmitter<string|MaterializeAction>();
  private errorMessage = new EventEmitter<string|MaterializeAction>();
  private driverList:User[]=[];
  private driverSelected;
  private entityKeyToViewFiles: string=null;
  private attachmentsModal = new EventEmitter<string|MaterializeAction>();

  constructor(route:ActivatedRoute,private problemsServices:ProblemsService, private authService:AuthService) {
    super(route)
    this.startDate = new Date();
    this.startDate = (this.startDate.getMonth()+1)+'-'+(this.startDate.getDate())+'-'+this.startDate.getFullYear();
    this.endDate = new Date();
    this.endDate = (this.endDate.getMonth()+1)+'-'+(this.endDate.getDate())+'-'+this.endDate.getFullYear();
  }

  ngOnInit() {
    super.ngOnInit();
    this.problemsServices.getProblemsStatusList().then(res=>{
      this.problemsStatusList=res;
    });
    this.authService.getUsersByRole(this.ROLE_NAMES.DRIVER, false).then(res=>{
      this.driverList = res.records;
      Styles.fixDropDownHeigh("smallDropdown", 5);
    });
    this.filter();
  }

  filter(){
    if(this.checkDatesRange()){
      this.problemsServices.getProblems(this.pageInfo,this.driverSelected == 'none'? null: this.driverSelected,this.parseDate(this.startDate),this.parseDate(this.endDate)).then(res => {
        this.problemsList=res.records
        this.totalProblems=res.total_records;
      });
    }
  }

  checkDatesRange(){
    let dia = this.startDate.split('-')[1];
    let mes = this.startDate.split('-')[0];
    let anio = this.startDate.split('-')[2];
    let fechaStart = new Date(anio,mes,dia);
    dia = this.endDate.split('-')[1];
    mes = this.endDate.split('-')[0];
    anio = this.endDate.split('-')[2];
    let fechaEnd = new Date(anio,mes,dia);
    if((fechaEnd.getTime() >= fechaStart.getTime())){
      return true;
    }else{
      this.filterToastError.emit('toast');
      return false;
    }
  }

  parseDate(date){
    let dia = date.split('-')[1];
    let mes = date.split('-')[0];
    let anio = date.split('-')[2];
    let fecha = new Date(anio,mes,dia);
    return (fecha.getMonth())+'/'+(fecha.getDate())+'/'+fecha.getFullYear();
  }

  private resetView(){
    this.pageInfo = {page:1,page_size:PAGE_SIZE};
    this.filter();
  }


  changePage(page) {
    this.pageInfo.page = page+1;
    this.filter();
  }


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

  cleanAttachmentView(){
    this.entityKeyToViewFiles=null;
  }

  /**
   *
   *
   * */
  public problemSolved(problem:Problem){
    this.problemsServices.updateProblemStatusToResolved(problem.id).then(res => {
      if (res){
        this.resetView();
      }else{
        this.errorMessage.emit('toast');
      }
    });

  }

  /**
   *
   *
   * */
  public problemNotSolved(problem:Problem){
    this.problemsServices.updateProblemStatusToNotResolved(problem.id).then(res => {
      if (res){
        this.resetView()
      }else{
        this.errorMessage.emit('toast');
      }
    });
  }

}
