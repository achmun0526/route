import {ActivatedRoute} from "@angular/router";
import {OnInit} from "@angular/core";
import {ASSETS_URL,ROLE_NAMES} from "./app-conf";
import {isNullOrUndefined} from "util";
import {Utils} from "./utils";
/**
 * 
 */
export class BaseComponent implements OnInit{

  protected ASSETS=ASSETS_URL;
  protected ROLE_NAMES=ROLE_NAMES;
  protected Utils=Utils;

  constructor(protected activatedRoute:ActivatedRoute) {}

  ngOnInit(){
    this.activatedRoute.data
      .subscribe((data:any) => {
        $('#sf-main-title').text(data.title);
      });
  }

  /**
   *
   * */
  isNullOrUndefined(param){
    return isNullOrUndefined(param);
  }

}
