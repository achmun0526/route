import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { Router, ActivatedRoute, Params} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { isNullOrUndefined} from "util";
import { SaveSiteComponent} from "../save-site/save-site.component";
import { SitesService } from '../../../services/sites/sites.service';
import { Site} from "../../../model/site";


@Component({
  selector: 'app-details-site',
  templateUrl: './details-site.component.html',
  styleUrls: ['./details-site.component.css']
})
export class DetailsSiteComponent extends BaseComponent implements OnInit {

	private site;
	private siteToEdit:Site = null;
	private editSiteModal = new EventEmitter<string|MaterializeAction>();

  constructor(activatedRoute: ActivatedRoute, private sitesService:SitesService) {
		super(activatedRoute);
		this.site = {};
	}

  ngOnInit() {
		super.ngOnInit();
		this.getSite();		
	}
	
	getSite(){
		this.activatedRoute.params.switchMap((params: Params) => this.sitesService.getSiteById(params['id'])).
		subscribe((siteRes:Site) => {
			this.site = siteRes;
		});
	}

	openEditSiteModal(siteToEdit){
		this.siteToEdit = siteToEdit;
		setTimeout(() => {
			this.editSiteModal.emit({action:'modal',params:['open']});
		  }, 100);
	}

	onSiteEdited(){
		this.siteToEdit = null;
		this.getSite();
	}

	onEditCancelled(){
		this.siteToEdit = null;
		setTimeout(() => {
			this.editSiteModal.emit({action:'modal',params:['close']});
		  }, 100);
	}

}
