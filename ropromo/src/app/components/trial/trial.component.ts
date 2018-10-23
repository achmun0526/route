import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-trial',
  templateUrl: './trial.component.html',
  styleUrls: ['./trial.component.css']
})
export class TrialComponent implements OnInit {
  @Output() onCancelAction = new EventEmitter();

  private email;
  private first_name;
  private last_name;
  private company_name;
  private password;
  private password_check;


  constructor() { }

  ngOnInit() {
  }

submitTrialRequest(){
  console.log("need to send info to my email here");
  console.log(this.first_name);
  // Add the below when the email is sent in order to let the pricing component know it should output the modal saying congrats
  // this.afterOrderSaved.emit();
}

}
