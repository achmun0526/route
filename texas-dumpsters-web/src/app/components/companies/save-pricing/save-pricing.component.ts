import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { isNullOrUndefined} from "util";
import { CompaniesService } from '../../../services/companies/companies.service';	


@Component({
  selector: 'app-save-pricing',
  templateUrl: './save-pricing.component.html',
  styleUrls: ['./save-pricing.component.css']
})
export class SavePricingComponent implements OnInit {

	@Output() reloadData = new EventEmitter();    
	private pricing;
	private title;
	private companiPricing;
	//add price modal
	private pricingModal = new EventEmitter<string|MaterializeAction>();
	//add price toasts
	private addPriceToast = new EventEmitter<string|MaterializeAction>();
  private addPriceToastError = new EventEmitter<string|MaterializeAction>();
	//delete price toasts
	private deletePriceToast = new EventEmitter<string|MaterializeAction>();
  private deletePriceToastError = new EventEmitter<string|MaterializeAction>();
	
  constructor(private companiesService:CompaniesService) { 
	}

  ngOnInit() {
		this.pricing = {};
		this.companiPricing = {};
  }
	/**edit price function**/
	savePrice(){
		if(this.pricing.id == undefined){
			this.companiPricing.entries.push(this.pricing);
		}
		this.companiesService.addPricingCompany(this.companiPricing).then(res=>{
			if(res != null){
				this.addPriceToast.emit('toast');
			}else{
				this.addPriceToastError.emit('toast');
			}
			this.reloadData.emit();
			this.closePricingModal();
		});
	}
	 
	/**edit price function**/
	editPrice(data,num){
		this.title = "Edit Pricing";
		this.companiPricing.company_key = data.id	;
		this.companiPricing.entries = data.service_pricing;
		this.pricing = data.service_pricing[num];
		this.openPricingModal();
	}
	/**add price function**/
	addPrice(entries,company){
		this.title = "Add Pricing to ", company.name;
		this.pricing = {};
		this.pricing.active = true;
		this.companiPricing.company_key = company.id	;
		this.companiPricing.entries = entries;
		this.openPricingModal();
	}
	 /**edit price function**/
	deletePrice(data,num){
		this.companiPricing.company_key = data.id	;
		this.companiPricing.entries = data.service_pricing;
		this.companiPricing.entries[num].active = false;
		this.pricing = this.companiPricing.entries[num];
		this.savePrice();
		//this.companiPricing.entries.splice(num,1);
	}
	
	
	/** modals functions **/
	openPricingModal() {
    this.pricingModal.emit({action:"modal",params:['open']});
  }
  closePricingModal() {
    this.pricingModal.emit({action:"modal",params:['close']});
  }

}
