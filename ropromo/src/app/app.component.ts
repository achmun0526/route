import {Component,AfterViewInit, ViewChild, EventEmitter, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition, query, stagger } from '@angular/animations';
import { isNullOrUndefined} from "util";




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

  // animations: [
  //   trigger('heroState', [
  //     state('inactive', style({
  //       backgroundColor: '#42f4bc',
  //       transform: 'translate(-3em,0)'
  //     })),
  //     state('active',   style({
  //       backgroundColor: '#9e42f4',
  //       transform: 'scale(1.1)'
  //     })),
  //     transition('inactive => active', animate('5000ms ease-in')),
  //     transition('active => inactive', animate('5000ms ease-out'))
  //   ])
  // ],
})
export class AppComponent implements OnInit{

  public state = 'inactive';

  constructor() {
  }

  ngOnInit(): void {
  }

  toggleState() {
    console.log("Toggling the state");
    if(this.state=='active'){
      this.state='inactive';
    }else if(this.state=='inactive'){
      this.state='active';
    }
    console.log(this.state);
  }

  /**
   *
   * */
  isNullOrUndefined(param){
    return isNullOrUndefined(param);
  }

}
