import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {MaterializeDirective, MaterializeAction} from "angular2-materialize";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @Input() modalContent;
  @Output() okFunction = new EventEmitter();
  @Output() cancelFunction = new EventEmitter();

  modalActions = new EventEmitter<string|MaterializeAction>();

  constructor() {}

  ngOnInit() {
  }
  
  /**modal functions
  *open and close modal 
  **/ 
  openModal() {
    this.modalActions.emit({action:"modal",params:['open']});
  }
  closeModal() {
    this.modalActions.emit({action:"modal",params:['close']});
  }
  
  ok(){
    this.okFunction.emit();
    this.closeModal();
  }
  cancel(){
    this.cancelFunction.emit();
    this.closeModal();
  }
}