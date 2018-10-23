import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { isNullOrUndefined} from "util";
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { BaseComponent} from "../../../common/base-component";
import { YardsService } from '../../../services/yards/yards.service';
import { SharedService } from '../../../services/shared/shared.service';
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-save-yards',
  templateUrl: './save-yards.component.html',
  styleUrls: ['./save-yards.component.css']
})
export class SaveYardsComponent extends BaseComponent implements OnInit {

	@Output() reloadData = new EventEmitter();
	private yard;
	private title;
	private selectCompany;
	// private seletedCompany;

	//add Yards modal
	private yardsModal = new EventEmitter<string|MaterializeAction>();
	//add Yards toasts
	private addYardsToast = new EventEmitter<string|MaterializeAction>();
  private addYardsToastError = new EventEmitter<string|MaterializeAction>();
	//delete Yards toasts
	private deleteYardsToast = new EventEmitter<string|MaterializeAction>();
  private deleteYardsToastError = new EventEmitter<string|MaterializeAction>();
	 // address error toats
  private addressYardsToastError = new EventEmitter<string|MaterializeAction>();
  private validations = {
	  latlong_valid: true
  }

  constructor(activatedRoute:ActivatedRoute,private yardsService:YardsService, private sharedService:SharedService) {
		super(activatedRoute);
    this.yard = null;
	}

  ngOnInit() {
  }

	/** save yards function **/
	saveYard(){
		this.validateLatLong();
		if(this.validations.latlong_valid){
			this.callServices();
		}
	}

	//**call the services **//
	callServices(){
		this.yard.active = true;
		this.yardsService.saveYards(this.yard).then(res =>{
			if(res != null){
				this.addYardsToast.emit('toast');
				this.reloadData.emit();
			}else{
				this.addYardsToastError.emit('toast');
			}
			this.closeYardsModal();
		});
	 }

	 /** save yard function **/
	inactiveYards(){
		this.yardsService.saveYards(this.yard).then(res =>{
			if(res != null){
				this.deleteYardsToast.emit('toast');
				this.reloadData.emit();
			}else{
				this.deleteYardsToastError.emit('toast');
			}
		});
	}

	/** edit Yard function **/
	editYards(data){
	  this.yard=null;
	  setTimeout(()=>{
      this.title = "Edit";
      this.yard = JSON.parse(JSON.stringify(data));
      setTimeout(()=>{		this.openYardsModal();},100);
    },100);

	}

	/** delete Yard function **/
	deleteYards(data){
		this.yard = data;
		this.yard.active = false;
		this.inactiveYards();
	}

	/** add Yard function **/
	addYards(data){
	  this.yard=null;
	  setTimeout(()=>{
      this.title = "Add a Yard to " + data.name;
      this.yard = {};
      setTimeout(()=>{
        this.yard.company_key = data.id
        this.openYardsModal();
      },100);
    },100);

	}

	/** modals functions **/
	openYardsModal() {
    this.yardsModal.emit({action:"modal",params:['open']});
  }
  closeYardsModal() {
    this.yardsModal.emit({action:"modal",params:['close']});
  }

	//*change phone numeber model update *//
	 changePhone(ev){
		 this.yard.contact_phone = ev;
	 }

	validateLatLong(){
		if(this.yard.latitude == null || this.yard.latitude == '' || this.yard.latitude == undefined){
			this.validations.latlong_valid = false;
		}else{
			this.validations.latlong_valid = true;
		}
	}


}
