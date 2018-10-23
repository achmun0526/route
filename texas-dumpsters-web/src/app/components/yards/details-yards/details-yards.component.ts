import { Component, OnInit, ViewChild } from '@angular/core';
import { SaveYardsComponent} from "../save-yards/save-yards.component";
import { ActivatedRoute, Params} from '@angular/router';
import { BaseComponent} from "../../../common/base-component";
import { YardsService } from '../../../services/yards/yards.service';
import { Yard} from "../../../model/yard";

@Component({
  selector: 'app-details-yards',
  templateUrl: './details-yards.component.html',
  styleUrls: ['./details-yards.component.css']
})
export class DetailsYardsComponent extends BaseComponent implements OnInit {

  private yard;

	// vehicle modal
	@ViewChild(SaveYardsComponent) yardsModal:SaveYardsComponent;

  constructor(activatedRoute:ActivatedRoute, private yardsService:YardsService) {
		super(activatedRoute);
		this.yard = {};
	}

	ngOnInit() {
		super.ngOnInit();
		this.activatedRoute.params.switchMap((params: Params) => this.yardsService.getYardsById(params['id'])).
				subscribe((yardRes:Yard) => {
				this.yard = yardRes;
		});
  }

	editYards(){
		this.yardsModal.editYards(this.yard);
	}

}
