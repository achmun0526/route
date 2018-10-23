import { Component, OnInit, EventEmitter} from '@angular/core';
import { MaterializeDirective, MaterializeAction } from "angular2-materialize";
import {TrialComponent} from '../trial/trial.component';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {
private trial_modal = new EventEmitter<string|MaterializeAction>();
private trial_modal_activated=false;
  constructor() { }

  ngOnInit() {

  }

  showTrialModal(){
    this.trial_modal_activated=true;
    setTimeout(() => {
      this.trial_modal.emit({action:'modal',params:['open']});
      }, 100);
  }

  closeTrialModal(){
    this.trial_modal.emit({action:'modal',params:['close']});
  }

  onTrialRequested(){
    console.log("Output some text saying congrats");
  }
}
