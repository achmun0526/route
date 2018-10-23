import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { SaveDisposalComponent} from "../save-disposal/save-disposal.component";
import { Router, ActivatedRoute, Params} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { Facility} from "../../../model/facility";
import {FacilitiesService} from "../../../services/facilities/facilities.service";

@Component({
  selector: 'app-details-disposal',
  templateUrl: './details-disposal.component.html',
  styleUrls: ['./details-disposal.component.css']
})
export class DetailsDisposalComponent extends BaseComponent implements OnInit {

	private diposal;
	// vehicle modal
	@ViewChild(SaveDisposalComponent) disposalModal:SaveDisposalComponent;

  constructor(activatedRoute:ActivatedRoute,private facilitiesService:FacilitiesService) {
		super(activatedRoute);
		this.diposal = {};
	}

  ngOnInit() {
		super.ngOnInit();

		this.activatedRoute.params.switchMap((params: Params) => this.facilitiesService.getDisposalId(params['id'])).
				subscribe((disposalRes:Facility) => {
				this.diposal = disposalRes;
		});
  }
	editDisposals(){
		this.disposalModal.editDisposals(this.diposal)
	}

}
