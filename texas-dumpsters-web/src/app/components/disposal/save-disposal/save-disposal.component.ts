import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { SharedService } from '../../../services/shared/shared.service';
import {FacilitiesService} from "../../../services/facilities/facilities.service";
import {BaseComponent} from "../../../common/base-component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-save-disposal',
  templateUrl: './save-disposal.component.html',
  styleUrls: ['./save-disposal.component.css']
})
export class SaveDisposalComponent extends BaseComponent implements OnInit {

	private disposal;
	private title;
	private selectCompany;
	@Output() reloadData = new EventEmitter();
	//save disposal modal
	private disposalsModal = new EventEmitter<string|MaterializeAction>();
	//save disposal toasts
	private addDisposalsToast = new EventEmitter<string|MaterializeAction>();
  private addDisposalsToastError = new EventEmitter<string|MaterializeAction>();

	//delete disposal toasts
	private addressDisposalsToast = new EventEmitter<string|MaterializeAction>();
	//delete disposal toasts
	private deleteDisposalsToast = new EventEmitter<string|MaterializeAction>();
  private deleteDisposalsToastError = new EventEmitter<string|MaterializeAction>();

  constructor(activatedRoute:ActivatedRoute,private facilitiesService : FacilitiesService, private sharedService:SharedService) {
		super(activatedRoute);
    this.disposal = null;
	}

  ngOnInit() {
  }

	//** save disposal **//
	saveDisposals(){
    this.callServices();
	}

	//** call the save service **//
	callServices(){
		this.disposal.active = true;
		this.facilitiesService.saveDisposal(this.disposal).then(res =>{
			if(res != null){
				this.addDisposalsToast.emit('toast');
				this.reloadData.emit();
			}else{
				this.addDisposalsToastError.emit('toast');
			}
			this.closeDisposalsModal();
		});
	}


	//*change phone numeber model update *//
	 changePhone(ev){
		 this.disposal.contact_phone = ev;
	 }

	/**
   *
   * Edit disposal
   *
   * **/
	editDisposals(data){
	  this.disposal=null;
	  setTimeout(()=>{
      this.title = "Edit " + data.facility_name;
      this.disposal = data;
      setTimeout(()=>{this.openDisposalsModal();},100);
    },100);
	}

	/** delete disposal **/
	deleteDisposals(data){
		this.disposal = data;
		this.disposal.active = false;
		this.facilitiesService.saveDisposal(this.disposal).then(res =>{
			if(res != null){
				this.deleteDisposalsToast.emit('toast');
				this.reloadData.emit();
			}else{
				this.deleteDisposalsToastError.emit('toast');
			}
			this.closeDisposalsModal();
		});
	}

	/** add disposal **/
	addDisposals(data){
		this.title = "Add a Facility to " + data.name;
		this.disposal = null;
		setTimeout(()=>{
		  this.disposal={};
		  setTimeout(()=>{
        this.disposal.company_key = data.id
        this.openDisposalsModal();
      },100);
    },100);

	}

		/** modals functions **/
	openDisposalsModal() {
    this.disposalsModal.emit({action:"modal",params:['open']});
  }
  closeDisposalsModal() {
    this.disposalsModal.emit({action:"modal",params:['close']});
  }

}
