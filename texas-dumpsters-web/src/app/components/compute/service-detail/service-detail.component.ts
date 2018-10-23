import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { BaseComponent } from "../../../common/base-component";
import { Styles } from "../../../common/styles";
import { PURPOSE_OF_SERVICE_LIST,ASSET_SIZE_LIST} from '../../../common/app-conf';
@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css']
})
export class ServiceDetailComponent implements OnInit {
  @Input() public service_detail_info:any;
  @Input() public service_detail_number:number;
  constructor() { }

  ngOnInit() {

  }

  get_service_type(){
    let type = this.service_detail_info['entity']['purpose_of_service'];
    for(var i=0;i<PURPOSE_OF_SERVICE_LIST.length;i++){
      let val = PURPOSE_OF_SERVICE_LIST[i].val;
      if(val==type){
        return PURPOSE_OF_SERVICE_LIST[i].name;
      }
    }
  }

  get_service_size(){
    let size  = this.service_detail_info['entity']['asset_size'];
    for(var i=0;i<ASSET_SIZE_LIST.length;i++){
      let val = ASSET_SIZE_LIST[i].val;
      if(val==size){
        return ASSET_SIZE_LIST[i].name;
      }
    }
  }

}
