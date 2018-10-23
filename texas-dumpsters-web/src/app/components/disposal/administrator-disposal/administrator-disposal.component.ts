import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { CsvFileComponent} from "../../common/csv-file/csv-file.component";
import { SaveDisposalComponent} from "../save-disposal/save-disposal.component";
import { Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { AuthService } from '../../../services/auth/auth.service';
import {FacilitiesService} from "../../../services/facilities/facilities.service";


@Component({
  selector: 'app-administrator-disposal',
  templateUrl: './administrator-disposal.component.html',
  styleUrls: ['./administrator-disposal.component.css']
})
export class AdministratorDisposalComponent extends BaseComponent  implements OnInit {

	private disposalsList = [];
	private selectCompany;
	private csv;
	private totalDisposals = 0;
	private pageInfo = {page:1,page_size:PAGE_SIZE};

	// Facility modal
	@ViewChild(SaveDisposalComponent) disposalsModal:SaveDisposalComponent;
	// CSV modal
	@ViewChild(CsvFileComponent) CSVModal:CsvFileComponent;

  constructor(private router:Router, actRoute:ActivatedRoute, private authService:AuthService,private facilitiesService:FacilitiesService) {
		super(actRoute);
		this.csv = {};
	}

  ngOnInit() {
		super.ngOnInit();
		this.getDisposals();
		this.selectCompany = this.authService.getCurrentSelectedCompany();
  }

		/** Go to details of the vehicle **/
	detailsDisposals(data){
		this.router.navigate(["/settings/disposals_details", data.id]);
	}
	/** open modal to edit a vehicles **/
	editDisposals(data){
		this.disposalsModal.editDisposals(data);
	}

	/** open modal to delete a vehicles **/
	deleteDisposals(data){
		this.disposalsModal.deleteDisposals(data);
	}

	/** open modal to add a vehicles **/
	addDisposals(){
		this.disposalsModal.addDisposals(this.selectCompany);
	}

	/** open modal to add a vehicles **/
	addCVSfile(){
		this.csv = {
			company_key :this.selectCompany.id
		}
		this.CSVModal.addCVSfile(this.csv);
	}

	/**get disposals**/
	getDisposals(){
		this.facilitiesService.getFacilities(this.pageInfo).then(res =>{
			this.disposalsList = res.records;
			this.totalDisposals= res.total_records;
		});
	}

	/** Load data of new page **/
	changePage(page) {
    this.pageInfo.page = page+1;
    this.getDisposals();
  }


}
