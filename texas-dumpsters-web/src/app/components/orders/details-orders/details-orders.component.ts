import {Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { MaterializeAction} from "angular2-materialize";
import { OrdersService } from '../../../services/orders/orders.service';
import { Order} from "../../../model/order";
import {KeyValueEntity} from "../../../model/key_value_entity";
import {Problem} from "../../../model/problem";
import {ProblemsService} from "../../../services/problems/problems.service";
import { PAGE_SIZE } from '../../../common/app-conf';



@Component({
  selector: 'app-details-orders',
  templateUrl: './details-orders.component.html',
  styleUrls: ['./details-orders.component.css']
})
export class DetailsOrdersComponent extends BaseComponent implements OnInit {

	private order:Order=null;
	private orderStateList:KeyValueEntity[]=[];
  private purposeServiceList:KeyValueEntity[]=[];
  private editOrderModal = new EventEmitter<string|MaterializeAction>();

  private problemsList:Problem[]=[];
  private problemsStatusList:KeyValueEntity[]=[];
  private pageInfo = {page:1,page_size:PAGE_SIZE};
  private totalProblems=0;
  private entityKeyToViewFiles: string=null;
  private attachmentsModal = new EventEmitter<string|MaterializeAction>();
  private errorMessage = new EventEmitter<string|MaterializeAction>();

  constructor(activatedRoute: ActivatedRoute, private ordersService:OrdersService, private problemsServices:ProblemsService) {
		super(activatedRoute);
	}

  ngOnInit() {
		super.ngOnInit();
    this.ordersService.getOrderStateList().then(res=>this.orderStateList=res);
    this.ordersService.getPurposeOfServiceList().then(res=>this.purposeServiceList=res);
		this.activatedRoute.params.switchMap((params: Params) => this.ordersService.getOrderById(params['id'])).
				subscribe((orderRes:Order) => {
        this.order=orderRes;
        this.loadProblemStatusList();
		});
  }
  /**
   *
   *
   * */
  onOrderUpdated(){
    this.editOrderModal.emit({action:'modal',params:['close']});
    this.ordersService.getOrderById(this.order.id).then(res=>this.order=res);
  }

  /**
   *
   *
   * */
  onEditCancelled(){
    this.editOrderModal.emit({action:'modal',params:['close']});
  }

  loadProblemStatusList(){
    // get problem status list
    this.problemsServices.getProblemsStatusList().then(res=>{
      this.problemsStatusList=res;
      this.loadProblems();
    });
  }

  loadProblems(){
    this.problemsServices.getProblemsByServiceOrder(this.pageInfo, this.order.id).then(res => {
      this.problemsList=res.records
      this.totalProblems=this.problemsList.length;
    });
  }

  viewAttachments(entity_key:string){
    this.entityKeyToViewFiles=null;
    setTimeout(()=>{
      this.entityKeyToViewFiles=entity_key;
      setTimeout(() => {
        this.attachmentsModal.emit({action:'modal',params:['open']});
      }, 100);
    },100);
  }

  public problemSolved(problem:Problem){
    this.problemsServices.updateProblemStatusToResolved(problem.id).then(res => {
      if (res){
        this.resetView();
      }else{
        this.errorMessage.emit('toast');
      }
    });
  }

  public problemNotSolved(problem:Problem){
    this.problemsServices.updateProblemStatusToNotResolved(problem.id).then(res => {
      if (res){
        this.resetView()
      }else{
        this.errorMessage.emit('toast');
      }
    });
  }

  private resetView(){
    this.pageInfo = {page:1,page_size:PAGE_SIZE};
    this.loadProblems();
  }

}
