import {Component, OnInit, Input, Output, EventEmitter, OnChanges} from '@angular/core';
import {PAGE_SIZE} from '../../../common/app-conf';
@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit,OnChanges {
  @Input() totalObjects;
  @Input() maxPaginationDisplay;
  @Output() pageChange = new EventEmitter();
  pagination = [];
  selectpage;
  lastPage;
  totalPages;
  nextGroupDisplay = false;
  previousGroupDisplay = false;
  constructor() { }

  ngOnInit() {
   	this.selectpage = 0;
		this.maxPaginationDisplay = 5;
  }

  ngOnChanges(totalObjects) {
		if(this.pagination.length == 0){
			this.totalPages = this.totalObjects/PAGE_SIZE;
			if (this.totalObjects%PAGE_SIZE!=0){
				this.totalPages ++;
			}
			this.totalPages - this.totalPages - this.totalObjects%PAGE_SIZE;
			this.pagination=[];
			if(this.totalPages < 2){
				this.pagination=[0];
			}
			else{
				for(var i = 0; i <= this.totalPages; i++){
					if(i < this.maxPaginationDisplay +1 ){
						this.pagination.push(i);
					}
				}
			}
			if(this.totalPages> this.maxPaginationDisplay){
				this.nextGroupDisplay = true;
			}
			this.lastPage = this.pagination.length -1;
			this.pagination.splice(-1,1);
			this.totalPages = Math.floor(this.totalPages);
		}
  }

  nextPage(){
    this.selectpage++;
    this.pageChange.emit(this.selectpage);
		var last = this.pagination[this.pagination.length - 1];
		if(this.selectpage >= last  && last + 1 < this.totalPages){  //**
      console.log("moving to next group");
			this.nextGroup();
		}

  }

  previousPage(){
		var first = this.pagination[0];
		if(first  == this.selectpage && first > 0 ){
			this.previusGroup();
		}else{
			this.selectpage = this.selectpage -1;
			this.pageChange.emit(this.selectpage);
		}
  }
  numberPage(i){
    this.selectpage = i;
    this.pageChange.emit(this.selectpage);
		var last = this.pagination[this.pagination.length-1];
    console.log("-----------------------------------------");
    console.log(this.pagination);
    console.log("Pagination.lengh: "+this.pagination.length);
    console.log("last: " + last);
    console.log("selectPage"+this.selectpage);
    console.log("total page: " + this.totalPages);
		if(last == this.selectpage && last + 1 < this.totalPages){
			this.nextGroup();
		}
  }

	/*
	load the next group of pages
	*/
	nextGroup(){
    console.log("nextGroup");
		var temStar = this.pagination[this.pagination.length - 1];
		var temEnd = temStar +this.maxPaginationDisplay;
		this.pagination =[];
		for (var i = temStar; i < temEnd; i ++){
			if (i <= this.totalPages -1){
				this.pagination.push(i);
			}
		}
		if(this.pagination[0] > 1){
			this.previousGroupDisplay = true;
		}
		this.selectpage = this.pagination[0];
    console.log("this.selectpage: "+this.selectpage);
		this.pageChange.emit(this.selectpage);
	}


	/*
	load the previus group of pages
	*/
	previusGroup(){
		var startPage = this.pagination[0] ;
		this.pagination = [];
		var endNumber = startPage - this.maxPaginationDisplay;
		for(var i = startPage; i>endNumber; i--){
			if(	i >= 0){
				this.pagination.push(i);
			}
    }
		this.pagination.sort();
		this.selectpage = this.pagination[this.pagination.length -1];
		if(this.pagination[this.maxPaginationDisplay -1] >= this.totalPages){
			this.nextGroupDisplay = false;
		}else{
			this.nextGroupDisplay = true;
		}
		if (this.pagination[0] < 1){
			this.previousGroupDisplay = false;
		}else{
			this.previousGroupDisplay = true;
		}
		this.lastPage = this.pagination.length -1;
		this.pageChange.emit(this.selectpage);
	}

}
