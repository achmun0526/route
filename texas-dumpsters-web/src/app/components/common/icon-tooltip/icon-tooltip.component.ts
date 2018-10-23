import { Component, OnInit, Input} from '@angular/core';
import {MaterializeDirective,MaterializeAction} from 'angular2-materialize';

@Component({
  selector: 'app-icon-tooltip',
  templateUrl: './icon-tooltip.component.html',
  styleUrls: ['./icon-tooltip.component.css']
})
export class IconTooltipComponent implements OnInit {
	@Input() iconName;
	@Input() tooltipText;
	@Input() tooltipPosition;
	@Input() iconSize;
	@Input() iconWidth;

	constructor() { }

  ngOnInit() {
		if(this.tooltipPosition == undefined ){
			this.tooltipPosition = 'top';
		}
  }

}
