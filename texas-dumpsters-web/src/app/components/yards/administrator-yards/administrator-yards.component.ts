/*
 * Copyright (c) [2018], Forest Schwartz. All rights reserved
 *
 * Duplication or reproduction of this code is strictly forbidden without the written and signed consent of the Author.
 */

/*
 * File:   main.cpp
 * Author: forest schwartz
 *
 * Created on December 12, 2017, 7:09 PM
 */

import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { CsvFileComponent} from "../../common/csv-file/csv-file.component";
import { SaveYardsComponent} from "../save-yards/save-yards.component";
import { Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { YardsService } from '../../../services/yards/yards.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-administrator-yards',
  templateUrl: './administrator-yards.component.html',
  styleUrls: ['./administrator-yards.component.css']
})
export class AdministratorYardsComponent extends BaseComponent implements OnInit {

	private yardsList =[];
	private totalYards = 0;;
	private csv;
	private selectCompany;
	private pageInfo = {page:1,page_size:PAGE_SIZE};

	// yards modal
	@ViewChild(SaveYardsComponent) yardsModal:SaveYardsComponent;
	// CSV modal
	@ViewChild(CsvFileComponent) CSVModal:CsvFileComponent;

  constructor(private router:Router, actRoute:ActivatedRoute, private yardsService:YardsService, private authService:AuthService) {
		super(actRoute);
		this.csv = {};
		this.selectCompany = this.authService.getCurrentSelectedCompany();
	}

  ngOnInit() {
		super.ngOnInit();
		this.getYards();
  }

	/** Go to details of the vehicle **/
	detailsYards(data){
		this.router.navigate(["/settings/yards_details",data.id]);
	}
	/** open modal to edit a vehicles **/
	editYards(data){
		this.yardsModal.editYards(data);
	}

	/** open modal to delete a vehicles **/
	deleteYards(data){
		this.yardsModal.deleteYards(data);
	}

	/** open modal to add a vehicles **/
	addYards(){
		this.yardsModal.addYards(this.selectCompany);
	}

	/** open modal to add a vehicles **/
	addCVSfile(){
		this.csv.company_key = this.selectCompany.id
		this.CSVModal.addCVSfile(this.csv);
	}

	/**get vehicles**/
	getYards(){
    console.log("inside get yards");
		this.yardsService.getYards(this.pageInfo).then(res =>{
			this.yardsList = res.records;
			this.totalYards= res.total_records;
		});
	}

	/** Load data of new page **/
	changePage(page) {
    this.pageInfo.page = page+1;
    this.getYards();
  }


}
