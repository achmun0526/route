import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaterializeDirective, MaterializeAction} from "angular2-materialize";
import { PAGE_SIZE} from '../../../common/app-conf';
import { isNullOrUndefined} from "util";
import { Router, ActivatedRoute, NavigationExtras} from '@angular/router';
import { CustomerService } from '../../../services/customer/customer.service';
import { BaseComponent} from "../../../common/base-component";
import { AuthService } from '../../../services/auth/auth.service';
import { AssetsService } from '../../../services/assets/assets.service';
import { OrdersService } from '../../../services/orders/orders.service';
import { Utils } from '../../../common/utils';

@Component({
  selector: 'assets-inventory',
  templateUrl: './assets-inventory.component.html',
  styleUrls: ['./assets-inventory.component.css']
})

export class AssetsInventoryComponent extends BaseComponent implements OnInit {

    private report: Array<any>;

    private assetsSizeList = [];
    
    constructor(private router:Router, actRoute:ActivatedRoute, private authService:AuthService, private assetsService:AssetsService, private ordersService: OrdersService){
        super(actRoute);
    }

    ngOnInit() {
		super.ngOnInit();
        this.report = new Array<any>();
        let field = false;
        this.ordersService.getAssetsSizeList().then(res=>this.assetsSizeList=res);
        this.assetsService.requestAsstesInventory(null).then(res => {
            if(res.length > 0){
                this.report.push([]);
                this.report[0].push('Location/Asset Size');
                for(let i = 0; i < res.length; i++){
                    field = false;
                    let index = this.report[0].indexOf(res[i].company.name);
                    if(res[i].yard == null){
                        index = this.report[0].indexOf('Field');
                        field = true;
                    }
                    if(index == -1){
                        if(!field){
                            this.report[0].push(res[i].company.name);
                        }else{
                            this.report[0].push('Field');
                        }
                        for(let k = 1; k < this.report.length; k++){
                            this.resize(this.report[k], this.report[0].length-1,0);
                        }
                        if(!field){
                            index = this.report[0].indexOf(res[i].company.name);
                        }else{
                           index = this.report[0].indexOf('Field');
                        }
                    }
                    let indexAsset = this.lookForAssetSize(res[i].asset_size);
                    if(indexAsset == -1){
                        this.report.push(new Array(this.report[0].length-1));
                        this.report[this.report.length-1][0] = res[i].asset_size;
                        this.report[this.report.length-1][index] = res[i].count;
                    }else{
                        this.report[indexAsset][index] = res[i].count;
                    }
                }
                let aux = this.report;
                this.report = new Array(aux[0].length-1);
                for(let i = 0; i < aux.length; i++){ 
                    for(let j = 0; j < aux[i].length; j++){
                        if(this.report[j] == null){
                            this.report[j] = new Array(aux[i].length-1);
                        }
                        this.report[j][i] = aux[i][j];
                    }
                }
                for(let i = 1; i < this.report[0].length; i++){
                    let menor = parseInt(Utils.findNameByIdOnKeyValueList(this.assetsSizeList, this.report[0][i]).split(' ')[0]);
                    let menorPosicion = i;
                    for(let j = i; j < this.report[0].length; j++){
                        if(i != j){
                            if(parseInt(Utils.findNameByIdOnKeyValueList(this.assetsSizeList, this.report[0][j]).split(' ')[0]) < menor){
                                menor = parseInt(Utils.findNameByIdOnKeyValueList(this.assetsSizeList, this.report[0][j]).split(' ')[0]);
                                menorPosicion = j;
                            }
                            if(j + 1 == this.report[0].length){
                                let aux = '';
                                for(let k = 0; k < this.report.length ; k++){
                                    aux = this.report[k][menorPosicion];
                                    this.report[k][menorPosicion] = this.report[k][i];
                                    this.report[k][i] = aux;
                                }
                            }
                        }
                    }
                }
            }

        },err => {

        })
    }

    lookForAssetSize(asset_size){
        let index = -1;
        for(let z = 0; z < this.report.length; z++){
            if(this.report[z][0] == asset_size){
                index = z;
                break;
            }
        }
        return index;
    }

    resize(arr, newSize, defaultValue) {
        while(newSize > arr.length)
            arr.push(defaultValue);
        arr.length = newSize;
    }
}